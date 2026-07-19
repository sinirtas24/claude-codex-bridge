"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(__dirname, "..");
const configPath = path.join(__dirname, "config.json");

function now() {
  return new Date().toISOString();
}

function log(message) {
  console.log(`[${new Date().toLocaleTimeString("tr-TR")}] ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function safeName(value) {
  return String(value || "proje")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "proje";
}

async function run(executable, args, options = {}) {
  const result = await execFileAsync(executable, args, {
    cwd: options.cwd || repoRoot,
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024,
    env: options.env || process.env,
  });
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
}

async function git(args) {
  return run("git", args, { cwd: repoRoot });
}

async function syncFromGitHub() {
  await git(["pull", "--rebase", "origin", "main"]);
}

async function commitAndPush(message) {
  await git(["add", "tasks", "results"]);
  const status = await git(["status", "--porcelain"]);
  if (!status) return;
  await git(["commit", "-m", message]);
  await git(["push", "origin", "main"]);
}

function buildClaudePrompt(task, projectPath, review = "") {
  const references = (task.reference_files || [])
    .map((item) => path.join(repoRoot, item))
    .filter((item) => fs.existsSync(item));

  return [
    "Yalnızca bulunduğun proje klasöründe çalış.",
    `Proje klasörü: ${projectPath}`,
    references.length
      ? `Önce şu referans dosyalarını görsel olarak incele: ${references.join(", ")}`
      : "Referans dosyası verilmedi.",
    "Kullanıcının görevi:",
    task.instruction,
    review ? `\nCodex denetim raporu:\n${review}\nRapordaki sorunların tamamını düzelt.` : "",
    "Mevcut çalışan özellikleri bozma. Mümkün olan testleri çalıştır.",
    "İş bitince yaptıklarını ve test sonuçlarını kısa ama açık biçimde raporla.",
  ].filter(Boolean).join("\n\n");
}

function buildReviewPrompt(task) {
  return [
    "Bu projeyi salt okunur şekilde denetle; dosyaları değiştirme.",
    `Kullanıcının asıl isteği: ${task.instruction}`,
    "İstenen özelliklerin gerçekten çalışıp çalışmadığını, tasarımın varsa referansa uygunluğunu, mobil görünümü, güvenliği ve testleri kontrol et.",
    "Ciddi veya kullanıcı isteğini engelleyen sorun varsa ilk satıra DUZELTME_GEREKIYOR yaz ve Claude'a uygulanabilir maddeler ver.",
    "Yeterince tamamlandıysa ilk satıra TAMAM yaz.",
  ].join("\n\n");
}

async function runClaude(config, task, projectPath, review = "") {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  const prompt = buildClaudePrompt(task, projectPath, review);
  return run(config.claude_exe, ["-p", prompt, "--permission-mode", "acceptEdits"], {
    cwd: projectPath,
    env,
  });
}

async function runCodex(config, task, projectPath) {
  return run(config.codex_exe, [
    "exec",
    "--sandbox", "read-only",
    "--skip-git-repo-check",
    buildReviewPrompt(task),
  ], { cwd: projectPath });
}

async function processTask(config, pendingFile) {
  const task = readJson(pendingFile);
  const id = task.id || path.basename(pendingFile, ".json");
  const projectName = safeName(task.project_name || id);
  const projectPath = path.resolve(config.projects_root, projectName);
  const workingFile = path.join(repoRoot, "tasks", "working", `${id}.json`);
  const resultFile = path.join(repoRoot, "results", `${id}.json`);

  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.dirname(workingFile), { recursive: true });
  fs.renameSync(pendingFile, workingFile);

  const result = {
    id,
    project_name: projectName,
    project_path: projectPath,
    status: "working",
    started_at: now(),
    rounds: [],
  };
  writeJson(resultFile, result);
  await commitAndPush(`Görev başladı: ${id}`);

  try {
    let review = "";
    const maxRounds = Math.max(1, Number(task.max_rounds || config.max_rounds || 3));

    for (let round = 1; round <= maxRounds; round += 1) {
      log(`${id}: Claude tur ${round} başladı.`);
      const claudeReport = await runClaude(config, task, projectPath, review);
      log(`${id}: Codex denetimi başladı.`);
      review = await runCodex(config, task, projectPath);
      result.rounds.push({ round, claude_report: claudeReport, codex_report: review });
      writeJson(resultFile, result);
      await commitAndPush(`Görev ilerlemesi: ${id}, tur ${round}`);

      if (!review.includes("DUZELTME_GEREKIYOR")) break;
    }

    result.status = review.includes("DUZELTME_GEREKIYOR") ? "needs_attention" : "completed";
    result.finished_at = now();
    writeJson(resultFile, result);
    const destination = path.join(repoRoot, "tasks", "completed", `${id}.json`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.renameSync(workingFile, destination);
    await commitAndPush(`Görev tamamlandı: ${id}`);
    log(`${id}: ${result.status}`);
  } catch (error) {
    result.status = "failed";
    result.finished_at = now();
    result.error = error.stderr || error.stdout || error.message || String(error);
    writeJson(resultFile, result);
    const destination = path.join(repoRoot, "tasks", "failed", `${id}.json`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (fs.existsSync(workingFile)) fs.renameSync(workingFile, destination);
    await commitAndPush(`Görev başarısız: ${id}`);
    log(`${id}: HATA - ${result.error}`);
  }
}

async function cycle(config) {
  await syncFromGitHub();
  const pendingDir = path.join(repoRoot, "tasks", "pending");
  fs.mkdirSync(pendingDir, { recursive: true });
  const tasks = fs.readdirSync(pendingDir)
    .filter((name) => name.endsWith(".json"))
    .sort();
  if (tasks.length) await processTask(config, path.join(pendingDir, tasks[0]));
}

async function main() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Eksik ayar dosyası: ${configPath}`);
  }
  const config = readJson(configPath);
  config.projects_root = config.projects_root || path.join(os.homedir(), "Claude-Denetim-Sistemi", "projects");
  config.claude_exe = config.claude_exe || path.join(os.homedir(), ".local", "bin", "claude.exe");
  config.codex_exe = config.codex_exe || "codex";
  const interval = Math.max(10, Number(config.poll_seconds || 20)) * 1000;

  log("Claude–Codex köprüsü hazır. Yeni görevler bekleniyor.");
  while (true) {
    try {
      await cycle(config);
    } catch (error) {
      log(`Bağlantı hatası: ${error.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
