import os
from typing import Optional

import httpx

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


async def _call_openai_chat(prompt: str, model: str = "gpt-3.5-turbo") -> str:
    if not OPENAI_API_KEY:
        # Return a canned fallback script when API key is not configured (useful for local testing)
        return (
            "[SCENE 1: HOOK]\nStop scrolling! Here's 3 quick AI productivity tips.\n\n"
            "[SCENE 2: TIP 1]\nUse role prompting: tell the AI what role to play to get tailored output.\n\n"
            "[SCENE 3: TIP 2]\nChain prompts: break tasks into steps and iterate for clarity.\n\n"
            "[SCENE 4: TIP 3]\nSpecify output format and constraints for concise results.\n\n"
            "[SCENE 5: CTA]\nTry these prompts now and subscribe for more AI growth hacks!"
        )

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    messages = [
        {"role": "system", "content": "You are a helpful assistant that writes concise video scripts with hooks and CTAs."},
        {"role": "user", "content": prompt},
    ]

    payload = {"model": model, "messages": messages, "temperature": 0.8, "max_tokens": 700}

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        # extract assistant content
        return data["choices"][0]["message"]["content"].strip()


async def generate_script(prompt: str, niche: Optional[str] = None, tone: Optional[str] = None,
                          length: Optional[str] = None, provider: str = "openai") -> str:
    """Generate a script using the selected provider. Falls back to OpenAI if Gemini not available."""
    # Build the augmented prompt with user options
    parts = [f"Write a short video script."]
    if niche:
        parts.append(f"Niche: {niche}.")
    if tone:
        parts.append(f"Tone: {tone}.")
    if length:
        parts.append(f"Target length: {length}.")
    parts.append("Include: a strong hook at the start, concise scenes or bullet points, and a closing CTA tailored for social media.")
    parts.append("")
    parts.append(f"User prompt: {prompt}")

    augmented = "\n".join(parts)

    if provider == "gemini":
        # For now Gemini is not integrated; fallback to OpenAI
        if not GEMINI_API_KEY:
            return await _call_openai_chat(augmented)
        # If Gemini integration is added later, implement here.
        return await _call_openai_chat(augmented)

    # default to openai
    return await _call_openai_chat(augmented)
