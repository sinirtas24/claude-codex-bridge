"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const tasksRoot = path.join(repoRoot, "tasks");
const resultsRoot = path.join(repoRoot, "results");
const projectsRoot = path.join(repoRoot, "projects");
const claudeExe = path.join(os.homedir(), ".local", "bin", "claude.exe");

function timestamp() {
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

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd || repoRoot,
      env: options.env || process.env,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.stdin.end();

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve(`${stdout}${stderr}`.trim());
      const error = new Error(`${executable} kod ${code} ile durdu.`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

async function git(args) {
  return run("git", args, { cwd: repoRoot });
}

async function pull() {
  await git(["pull", "--rebase", "origin", "main"]);
}

async function commitAndPush(message) {
  await git(["add", "tasks", "results", "projects"]);
  const status = await git(["status", "--porcelain"]);
  const relevant = status.split(/\r?\n/).filter((line) =>
    /(?:tasks|results|projects)[\\/]/.test(line)
  );
  if (!relevant.length) return;
  await git(["commit", "-m", message]);
  await pull();
  await git(["push", "origin", "main"]);
}

function makePrompt(task, projectPath) {
  const references = (task.reference_files || [])
    .map((file) => path.resolve(repoRoot, file))
    .filter((file) => fs.existsSync(file));

  return [
    "Yalnızca bulunduğun proje klasöründe çalış.",
    `Proje klasörü: ${projectPath}`,
    references.length
      ? `Göreve başlamadan önce şu referans dosyalarını mutlaka incele: ${references.join(", ")}`
      : "Bu görevde referans dosyası yok.",
    "Kullanıcının isteği:",
    task.instruction,
    "Eksik bir taslak bırakma. Mevcut çalışan özellikleri bozma.",
    "Mümkün olan testleri çalıştır ve iş bitince yaptıklarını kısa şekilde raporla.",
  ].join("\n\n");
}

async function runClaude(task, projectPath) {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  const started = Date.now();
  const heartbeat = setInterval(() => {
    const seconds = Math.round((Date.now() - started) / 1000);
    log(`Claude çalışıyor — geçen süre ${seconds} saniye.`);
  }, 30000);

  try {
    return await run(claudeExe, [
      "-p",
      makePrompt(task, projectPath),
      "--permission-mode",
      "acceptEdits",
    ], { cwd: projectPath, env });
  } finally {
    clearInterval(heartbeat);
  }
}

async function processTask(pendingFile) {
  const task = readJson(pendingFile);
  const id = safeName(task.id || path.basename(pendingFile, ".json"));
  const projectName = safeName(task.project_name || id);
  const projectPath = path.join(projectsRoot, projectName);
  const workingFile = path.join(tasksRoot, "working", `${id}.json`);
  const completedFile = path.join(tasksRoot, "completed", `${id}.json`);
  const failedFile = path.join(tasksRoot, "failed", `${id}.json`);
  const resultFile = path.join(resultsRoot, `${id}.json`);

  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.dirname(workingFile), { recursive: true });
  fs.renameSync(pendingFile, workingFile);
  const result = {
    id,
    project_name: projectName,
    status: "working",
    started_at: timestamp(),
  };
  writeJson(resultFile, result);

  try {
    log(`${id}: görev Claude'a verildi.`);
    result.claude_report = await runClaude(task, projectPath);
    result.status = "ready_for_chatgpt_review";
    result.finished_at = timestamp();
    writeJson(resultFile, result);
    fs.mkdirSync(path.dirname(completedFile), { recursive: true });
    fs.renameSync(workingFile, completedFile);
    await commitAndPush(`Claude görevi tamamladı: ${id}`);
    log(`${id}: tamamlandı ve ChatGPT denetimine gönderildi.`);
  } catch (error) {
    result.status = "failed";
    result.finished_at = timestamp();
    result.error = error.stderr || error.stdout || error.message || String(error);
    writeJson(resultFile, result);
    fs.mkdirSync(path.dirname(failedFile), { recursive: true });
    if (fs.existsSync(workingFile)) fs.renameSync(workingFile, failedFile);
    await commitAndPush(`Claude görevi başarısız: ${id}`);
    log(`${id}: HATA — ${result.error}`);
  }
}

async function cycle() {
  await pull();
  const pendingDir = path.join(tasksRoot, "pending");
  fs.mkdirSync(pendingDir, { recursive: true });
  const next = fs.readdirSync(pendingDir)
    .filter((name) => name.endsWith(".json"))
    .sort()[0];
  if (next) await processTask(path.join(pendingDir, next));
}

async function main() {
  if (!fs.existsSync(claudeExe)) {
    throw new Error(`Claude bulunamadı: ${claudeExe}`);
  }
  fs.mkdirSync(projectsRoot, { recursive: true });
  log("Basit Claude köprüsü hazır. Görevleri ChatGPT'den bekliyor.");
  while (true) {
    try {
      await cycle();
    } catch (error) {
      log(`Bağlantı hatası: ${error.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
