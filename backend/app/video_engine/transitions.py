from moviepy.editor import concatenate_videoclips


def crossfade_clips(clips, duration=0.6):
    """Concatenate clips with crossfade transition between them."""
    # moviepy's concatenate_videoclips supports method='compose' and padding
    return concatenate_videoclips(clips, method='compose', padding=-duration)
