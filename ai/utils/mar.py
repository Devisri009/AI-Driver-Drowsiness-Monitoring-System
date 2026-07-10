import numpy as np


def calculate_mar(mouth_landmarks):
    """
    Calculates the Mouth Aspect Ratio (MAR) for detecting mouth openness.

    Formula:
        MAR = (||p2 - p8|| + ||p3 - p7|| + ||p4 - p6||) / (2.0 * ||p1 - p5||)

    Arguments:
        mouth_landmarks (list of tuples/lists or objects): List containing 8 points
            ordered [p1, p2, p3, p4, p5, p6, p7, p8] where:
                p1 - left corner of mouth   (horizontal left)
                p2 - upper lip top-left     (vertical pair with p8)
                p3 - upper lip top-center   (vertical pair with p7)
                p4 - upper lip top-right    (vertical pair with p6)
                p5 - right corner of mouth  (horizontal right)
                p6 - lower lip bottom-right (vertical pair with p4)
                p7 - lower lip bottom-center(vertical pair with p3)
                p8 - lower lip bottom-left  (vertical pair with p2)

    Returns:
        float: Calculated Mouth Aspect Ratio. Returns 0.0 on invalid input
               or divide-by-zero.
    """
    if len(mouth_landmarks) != 8:
        raise ValueError(
            "MAR calculation requires exactly 8 landmarks in order "
            "[p1, p2, p3, p4, p5, p6, p7, p8]"
        )

    # Helper to extract (x, y) coordinates from either an object with .x/.y
    # attributes (MediaPipe landmark) or a plain sequence.
    def get_coords(p):
        if hasattr(p, 'x') and hasattr(p, 'y'):
            return np.array([p.x, p.y])
        return np.array([p[0], p[1]])

    p1 = get_coords(mouth_landmarks[0])
    p2 = get_coords(mouth_landmarks[1])
    p3 = get_coords(mouth_landmarks[2])
    p4 = get_coords(mouth_landmarks[3])
    p5 = get_coords(mouth_landmarks[4])
    p6 = get_coords(mouth_landmarks[5])
    p7 = get_coords(mouth_landmarks[6])
    p8 = get_coords(mouth_landmarks[7])

    # Vertical distances (lip separation at three horizontal positions)
    dist_v1 = np.linalg.norm(p2 - p8)
    dist_v2 = np.linalg.norm(p3 - p7)
    dist_v3 = np.linalg.norm(p4 - p6)

    # Horizontal distance (mouth width – corners)
    dist_h = np.linalg.norm(p1 - p5)

    # Avoid division by zero
    if dist_h == 0.0:
        return 0.0

    mar = (dist_v1 + dist_v2 + dist_v3) / (2.0 * dist_h)
    return mar
