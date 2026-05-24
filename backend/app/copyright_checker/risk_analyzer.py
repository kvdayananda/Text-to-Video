from typing import Any


def build_risk_report(audio_scan: dict[str, Any], video_scan: dict[str, Any], image_scan: dict[str, Any], trademark_scan: bool) -> dict[str, Any]:
    findings = []
    score = 100

    if audio_scan.get("available") and audio_scan.get("match"):
        findings.append({
            "id": len(findings) + 1,
            "type": "Audio Copyright Match",
            "severity": "High",
            "timestamp": "00:00 - 00:20",
            "source": audio_scan.get("source", "AudD/ACRCloud audio catalog"),
            "recommendation": "Replace the matched audio track with a licensed or royalty-free alternative.",
        })
        score -= 40
    elif audio_scan.get("available"):
        score -= min(16, max(0, 20 - audio_scan.get("score", 0)))

    if video_scan.get("available") and video_scan.get("duplicate"):
        findings.append({
            "id": len(findings) + 1,
            "type": "Duplicate Video Detection",
            "severity": "Medium",
            "timestamp": "00:05 - 00:12",
            "source": video_scan.get("source", "Visual fingerprint database"),
            "recommendation": "Review the matched segment and replace any duplicate footage before publishing.",
        })
        score -= 24
    elif video_scan.get("available"):
        score -= min(12, max(0, 20 - video_scan.get("score", 0)))

    if image_scan.get("available") and image_scan.get("bestMatch"):
        similarity = image_scan["bestMatch"].get("similarity", "0%")
        findings.append({
            "id": len(findings) + 1,
            "type": "Similar Image Match",
            "severity": "Low",
            "timestamp": "00:10 - 00:15",
            "source": image_scan["bestMatch"].get("source", "Stock image archive"),
            "recommendation": "Use an original thumbnail or frame capture to reduce reuse risk.",
        })
        score -= 12

    if trademark_scan:
        findings.append({
            "id": len(findings) + 1,
            "type": "Trademark Overlay Check",
            "severity": "Low",
            "timestamp": "00:00 - 00:30",
            "source": "Logo & brand text scanner",
            "recommendation": "Remove or blur trademarked logos and names unless you have explicit permission.",
        })
        score -= 8

    score = max(0, min(100, score))
    status = "Safe & Clear" if score >= 85 and not any(f["severity"] == "High" for f in findings) else "Medium Risk"
    color = "#00e5ff" if status == "Safe & Clear" else "#fbbf24"

    return {
        "status": status,
        "summary": "Automated copyright and safety scan completed.",
        "overallScore": score,
        "color": color,
        "findings": findings,
    }
