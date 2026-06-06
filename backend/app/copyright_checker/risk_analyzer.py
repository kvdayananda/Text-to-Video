from typing import Any


def build_risk_report(audio_scan: dict[str, Any], video_scan: dict[str, Any], image_scan: dict[str, Any], trademark_scan: dict[str, Any]) -> dict[str, Any]:
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
        score -= min(20, max(0, int((100 - audio_scan.get("score", 0)) / 4)))

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
        score -= min(16, max(0, int((100 - video_scan.get("score", 0)) / 3)))

    if image_scan.get("available") and image_scan.get("bestMatch"):
        confidence = int(image_scan["bestMatch"].get("confidence", 0))
        severity = "Low"
        if confidence >= 75:
            severity = "Medium"
        findings.append({
            "id": len(findings) + 1,
            "type": "Similar Image Match",
            "severity": severity,
            "timestamp": "00:10 - 00:15",
            "source": image_scan["bestMatch"].get("source", "Stock image archive"),
            "recommendation": "Use an original thumbnail or frame capture to reduce reuse risk.",
        })
        score -= min(16, max(0, int(confidence / 8)))

    if trademark_scan.get("available") and trademark_scan.get("matches"):
        for trademark in trademark_scan["matches"]:
            severity = trademark.get("severity", "Low")
            findings.append({
                "id": len(findings) + 1,
                "type": trademark.get("type", "Trademark Overlay Check"),
                "severity": severity,
                "timestamp": trademark.get("timestamp", "00:00 - 00:30"),
                "source": trademark.get("source", "Logo & brand text scanner"),
                "recommendation": trademark.get("recommendation", "Review any identified trademarks and remove them if you do not have permission."),
            })
            score -= 8 if severity == "Low" else 16

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
