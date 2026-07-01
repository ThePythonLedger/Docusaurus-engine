export async function verifyGitHubToken(token) {
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  });
  if (!response.ok) throw new Error('Invalid token');
  return await response.json();
}

export async function checkProjectSubmitted(token, username, repoName) {
  const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    headers: { Authorization: `token ${token}` },
  });
  return response.ok; // Returns true if repo exists and is accessible
}