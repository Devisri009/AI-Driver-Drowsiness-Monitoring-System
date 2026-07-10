import os

# Platform-specific sound player
try:
    import winsound
except ImportError:
    winsound = None

class AlarmPlayer:
    def __init__(self, sound_path):
        """
        Initializes the AlarmPlayer with the given sound file path.
        """
        self.sound_path = sound_path
        self._is_playing = False

    def start(self):
        """
        Starts playing the alarm sound asynchronously in a loop.
        If the alarm is already playing, does nothing.
        """
        if self._is_playing:
            return

        if winsound:
            try:
                # Ensure the sound path exists and is absolute/resolved properly
                resolved_path = os.path.abspath(self.sound_path)
                if os.path.exists(resolved_path):
                    winsound.PlaySound(
                        resolved_path,
                        winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP
                    )
                else:
                    # Fallback to system default beep if path not found
                    winsound.PlaySound("*", winsound.SND_ALIAS | winsound.SND_ASYNC | winsound.SND_LOOP)
            except Exception as e:
                print(f"Error starting alarm sound: {e}")
        else:
            print("[ALARM PLAYER] Playing sound (platform not supported / winsound missing)")
        
        self._is_playing = True

    def stop(self):
        """
        Stops the alarm sound.
        If the alarm is already stopped, does nothing.
        """
        if not self._is_playing:
            return

        if winsound:
            try:
                winsound.PlaySound(None, winsound.SND_PURGE)
            except Exception as e:
                print(f"Error stopping alarm sound: {e}")
        else:
            print("[ALARM PLAYER] Stopped sound")
        
        self._is_playing = False

    def is_playing(self):
        """
        Returns True if the alarm is currently playing, False otherwise.
        """
        return self._is_playing
