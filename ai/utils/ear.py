import numpy as np

def calculate_ear(eye_landmarks):
    """
    Calculates the Eye Aspect Ratio (EAR) for a single eye.
    
    Formula:
        EAR = (||p2 - p6|| + ||p3 - p5||) / (2.0 * ||p1 - p4||)
        
    Arguments:
        eye_landmarks (list of tuples/lists or objects): List containing 6 points
            ordered [p1, p2, p3, p4, p5, p6] where each point has x, y coordinates.
            
    Returns:
        float: Calculated Eye Aspect Ratio.
    """
    if len(eye_landmarks) != 6:
        raise ValueError("EAR calculation requires exactly 6 landmarks in order [p1, p2, p3, p4, p5, p6]")

    # Helper function to extract (x, y) coordinates
    def get_coords(p):
        if hasattr(p, 'x') and hasattr(p, 'y'):
            return np.array([p.x, p.y])
        return np.array([p[0], p[1]])

    p1 = get_coords(eye_landmarks[0])
    p2 = get_coords(eye_landmarks[1])
    p3 = get_coords(eye_landmarks[2])
    p4 = get_coords(eye_landmarks[3])
    p5 = get_coords(eye_landmarks[4])
    p6 = get_coords(eye_landmarks[5])

    # Calculate Euclidean distances
    dist_v1 = np.linalg.norm(p2 - p6)
    dist_v2 = np.linalg.norm(p3 - p5)
    dist_h = np.linalg.norm(p1 - p4)

    # Avoid division by zero
    if dist_h == 0.0:
        return 0.0

    ear = (dist_v1 + dist_v2) / (2.0 * dist_h)
    return ear
