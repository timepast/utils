const shelljs = require('shelljs');

const parseStatus = function(str) {
  let branch_line;
  const status = {
    local_branch: null,
    remote_branch: null,
    remote_diff: null,
    clean: true,
    files: []
  };
  let result;
  const initial_commit_rx = /^## Initial commit on ([^\n]+)\s?$/;
  const lines = str.trim().split('\n');
  branch_line = lines.shift();

  result = branch_line.match(initial_commit_rx);
  if (result) {
    status.local_branch = result[1];
    return status;
  }

  branch_line = branch_line.replace(/##\s+/, '');

  const branches = branch_line.split('...');
  status.local_branch = branches[0];
  status.remote_diff = null;
  if (branches[1]) {
    result = branches[1].match(/^([^\s]+)/);
    status.remote_branch = result[1];
    result = branches[1].match(/\[([^\]]+)\]/);
    status.remote_diff = result ? result[1] : null;
  }
  lines.forEach((s) => {
    if (s.match(/\S/)) {
      status.files.push(s);
    }
  });
  status.clean = status.files.length === 0;
  return status;
}

/*
 * 获取git的提交状态
 */
exports.getGitStatus = function (cwd) {
  const result = (shelljs.exec('git status --porcelain -b', { silent: true, cwd }).stdout.toString() || '').trim();
  return parseStatus(result);
}