from moviepy.editor import TextClip, CompositeVideoClip


def apply_text_overlay(clip, text: str, fontsize: int = 48, color: str = 'white', position=('center', 'center')):
    """Return a new clip with a text overlay composited on top."""
    txt = TextClip(text, fontsize=fontsize, color=color, method='caption')
    txt = txt.set_duration(clip.duration)
    txt = txt.set_position(position)
    return CompositeVideoClip([clip, txt])
