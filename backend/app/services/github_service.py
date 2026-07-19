import time
import logging
import httpx
from typing import Dict, List, Any, Optional
import jwt
from app.config import settings

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    def _get_app_jwt(self) -> Optional[str]:
        """Generate a GitHub App JSON Web Token (JWT) for authentication."""
        if not settings.GITHUB_APP_ID or not settings.GITHUB_APP_PRIVATE_KEY:
            logger.warning("GitHub App ID or Private Key not configured. Running in Mock fallback mode.")
            return None
            
        try:
            # Clean up private key spacing and quotes
            private_key = settings.GITHUB_APP_PRIVATE_KEY.strip().strip('"').strip("'").replace("\\n", "\n")
            payload = {
                "iat": int(time.time()) - 60,
                "exp": int(time.time()) + (10 * 60), # 10 mins expiry
                "iss": settings.GITHUB_APP_ID
            }
            return jwt.encode(payload, private_key, algorithm="RS256")
        except Exception as e:
            logger.error(f"Failed to generate GitHub App JWT: {e}")
            return None

    async def get_installation_token(self, installation_id: int) -> Optional[str]:
        """Fetch access token for a specific installation of the GitHub App."""
        jwt_token = self._get_app_jwt()
        if not jwt_token:
            return None

        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json"
        }
        
        try:
            response = await self.client.post(url, headers=headers)
            response.raise_for_status()
            return response.json().get("token")
        except Exception as e:
            logger.error(f"Failed to fetch GitHub installation access token: {e}")
            return None

    async def get_user_installation_repos(self, user_github_id: int) -> List[Dict[str, Any]]:
        """Find the GitHub App installation for a user and fetch all accessible repositories."""
        jwt_token = self._get_app_jwt()
        if not jwt_token:
            return []

        # 1. Fetch all installations of this GitHub App
        installations_url = "https://api.github.com/app/installations"
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json"
        }
        
        try:
            res = await self.client.get(installations_url, headers=headers)
            res.raise_for_status()
            installations = res.json()
            
            # 2. Find installation matching the user's github_id
            target_inst = None
            for inst in installations:
                if inst.get("account", {}).get("id") == user_github_id:
                    target_inst = inst
                    break
                    
            if not target_inst:
                return []
                
            # 3. Get installation token
            token = await self.get_installation_token(target_inst["id"])
            if not token:
                return []
                
            # 4. Fetch all repositories for this installation
            repos_url = "https://api.github.com/installation/repositories"
            repo_headers = {
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github+json"
            }
            repo_res = await self.client.get(repos_url, headers=repo_headers)
            repo_res.raise_for_status()
            
            return repo_res.json().get("repositories", [])
            
        except Exception as e:
            logger.error(f"Failed to fetch user installation repositories: {e}")
            return []

    async def get_pr_details(self, repo_full_name: str, pr_number: int, token: Optional[str] = None) -> Dict[str, Any]:
        """Fetch metadata details for a specific Pull Request."""
        if not token:
            raise ValueError("No GitHub token provided for get_pr_details.")

        url = f"https://api.github.com/repos/{repo_full_name}/pulls/{pr_number}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        
        try:
            response = await self.client.get(url, headers=headers)
            if response.status_code == 404:
                raise ValueError(f"PR #{pr_number} not found in {repo_full_name}.")
            response.raise_for_status()
            data = response.json()
            return {
                "number": data.get("number"),
                "title": data.get("title"),
                "base_branch": data.get("base", {}).get("ref"),
                "head_branch": data.get("head", {}).get("ref"),
                "base_sha": data.get("base", {}).get("sha"),
                "head_sha": data.get("head", {}).get("sha"),
                "additions": data.get("additions", 0),
                "deletions": data.get("deletions", 0),
                "changed_files": data.get("changed_files", 0)
            }
        except Exception as e:
            logger.error(f"Failed to fetch GitHub PR details: {e}")
            raise e

    async def get_commit_diff(self, repo_full_name: str, commit_hash: str, token: Optional[str] = None) -> str:
        """Fetch the raw code diff of a specific commit."""
        if not token:
            logger.warning("No GitHub token provided. Returning empty diff for commit.")
            return ""

        url = f"https://api.github.com/repos/{repo_full_name}/commits/{commit_hash}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3.diff" # Diff representation media type
        }
        
        try:
            response = await self.client.get(url, headers=headers)
            if response.status_code == 404:
                logger.warning(f"Commit {commit_hash} not found for diff. Returning empty diff.")
                return ""
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Failed to fetch GitHub commit diff: {e}")
            raise e

    async def get_recent_commits(self, repo_full_name: str, token: Optional[str] = None, limit: int = 3) -> List[Dict[str, Any]]:
        """Fetch recent commits from the repository."""
        if not token:
            return []

        url = f"https://api.github.com/repos/{repo_full_name}/commits?per_page={limit}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        
        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub recent commits: {e}")
            return []

    async def get_pr_diff(self, repo_full_name: str, pr_number: int, token: Optional[str] = None) -> str:
        """Fetch the raw code diff of a specific Pull Request."""
        if not token:
            raise ValueError("No GitHub token provided for get_pr_diff.")

        url = f"https://api.github.com/repos/{repo_full_name}/pulls/{pr_number}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3.diff" # Diff representation media type
        }
        
        try:
            response = await self.client.get(url, headers=headers)
            if response.status_code == 404:
                logger.warning(f"PR #{pr_number} not found for diff. Returning empty diff.")
                return ""
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Failed to fetch GitHub PR diff: {e}")
            raise e

    async def get_repo_tree(self, repo_full_name: str, branch: str = "main", token: Optional[str] = None) -> str:
        """Fetch the list of files in the repository using the Git Trees API."""
        if not token:
            raise ValueError("No GitHub token provided for get_repo_tree.")

        url = f"https://api.github.com/repos/{repo_full_name}/git/trees/{branch}?recursive=1"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        try:
            response = await self.client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                paths = [item.get("path") for item in data.get("tree", []) if item.get("type") == "blob"]
                return "\n".join(paths[:150])
            elif response.status_code == 404 and branch != "HEAD":
                logger.warning(f"Tree {branch} not found. Falling back to HEAD.")
                fallback_url = f"https://api.github.com/repos/{repo_full_name}/git/trees/HEAD?recursive=1"
                fb_response = await self.client.get(fallback_url, headers=headers)
                if fb_response.status_code == 200:
                    data = fb_response.json()
                    paths = [item.get("path") for item in data.get("tree", []) if item.get("type") == "blob"]
                    return "\n".join(paths[:150])
                else:
                    raise ValueError(f"Failed to fetch repo tree (status {fb_response.status_code}).")
            else:
                raise ValueError(f"Failed to fetch repo tree (status {response.status_code}).")
        except Exception as e:
            logger.error(f"Error fetching repo tree: {e}")
            raise e

    async def create_pr_review(
        self, repo_full_name: str, pr_number: int, comments: List[Dict[str, Any]], token: Optional[str] = None
    ) -> bool:
        """Post aggregated code-review comments back to GitHub as an official PR review."""
        if not token:
            raise ValueError("No GitHub token provided to post PR review.")

        url = f"https://api.github.com/repos/{repo_full_name}/pulls/{pr_number}/reviews"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        
        # Format comments array to match GitHub API specifications
        github_comments = []
        for c in comments:
            github_comments.append({
                "path": c.get("file"),
                "line": c.get("line"),
                "body": f"### CodeSageAI Review: {c.get('title')}\n**Severity**: {c.get('severity').upper()}\n\n{c.get('explanation')}\n\n**Fix Suggestion**:\n```typescript\n{c.get('code_after')}\n```"
            })
            
        payload = {
            "body": "CodeSageAI has completed analyzing this Pull Request. Discovered security, bug, and performance opportunities.",
            "event": "COMMENT",
            "comments": github_comments
        }
        
        try:
            response = await self.client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to post PR review to GitHub: {e}")
            return False

    async def get_repo_details(self, repo_full_name: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Fetch metadata details for a repository from GitHub API."""
        if not token:
            raise ValueError("No GitHub token provided for repository details.")

        url = f"https://api.github.com/repos/{repo_full_name}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch repository details from GitHub: {e}")
            raise e

    async def get_recent_prs(self, repo_full_name: str, token: Optional[str] = None, limit: int = 3) -> List[Dict[str, Any]]:
        """Fetch recent PRs from the repository to run automated scans against."""
        if not token:
            logger.warning("No GitHub token provided for PRs. Returning empty list.")
            return []

        url = f"https://api.github.com/repos/{repo_full_name}/pulls?state=all&sort=updated&direction=desc&per_page={limit}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json"
        }
        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch recent PRs for {repo_full_name}: {e}")
            return []

    async def get_repo_installation_id(self, repo_full_name: str) -> Optional[int]:
        """Query all app installations to find which one has access to this repository."""
        jwt_token = self._get_app_jwt()
        if not jwt_token:
            return None

        url = "https://api.github.com/app/installations"
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json"
        }
        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            installations = response.json()
            # Loop through installations to find the correct one
            for inst in installations:
                inst_id = inst.get("id")
                # Test if this installation has access to the repo by fetching token
                token = await self.get_installation_token(inst_id)
                if token:
                    # Verify if repo exists under this token
                    repo_url = f"https://api.github.com/repos/{repo_full_name}"
                    repo_headers = {
                        "Authorization": f"token {token}",
                        "Accept": "application/vnd.github+json"
                    }
                    repo_res = await self.client.get(repo_url, headers=repo_headers)
                    if repo_res.status_code == 200:
                        return inst_id
            return None
        except Exception as e:
            logger.error(f"Error finding installation ID for repo {repo_full_name}: {e}")
            return None

    async def close(self):
        await self.client.aclose()

# Global Singleton
github_service = GitHubService()
