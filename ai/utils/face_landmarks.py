# MediaPipe Face Mesh landmark indices for facial features

# Left Eye indices (from the subject's perspective)
LEFT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

# Left Eye EAR indices: order [p1, p2, p3, p4, p5, p6] (standard 6-point configuration)
LEFT_EYE_EAR_INDICES = [362, 385, 387, 263, 373, 380]

# Right Eye indices (from the subject's perspective)
RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

# Right Eye EAR indices: order [p1, p2, p3, p4, p5, p6] (standard 6-point configuration)
RIGHT_EYE_EAR_INDICES = [33, 160, 158, 133, 153, 144]

# Outer mouth contour indices (standard MediaPipe Face Mesh outer lip landmarks)
MOUTH_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 185, 40, 39, 37, 0, 267, 269, 270, 409, 415, 310, 311, 312, 13, 82, 81, 42, 183, 78]

# Mouth MAR indices: order [p1, p2, p3, p4, p5, p6, p7, p8]
#   p1 = 78  - left mouth corner
#   p2 = 81  - upper lip left
#   p3 = 13  - upper lip center
#   p4 = 311 - upper lip right
#   p5 = 308 - right mouth corner
#   p6 = 402 - lower lip right
#   p7 = 14  - lower lip center
#   p8 = 178 - lower lip left
MOUTH_MAR_INDICES = [78, 81, 13, 311, 308, 402, 14, 178]
