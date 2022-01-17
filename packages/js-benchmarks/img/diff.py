import cv2 as cv


def red(img):
    img[:, :, 0] = 0
    img[:, :, 1] = 0


def diff(a, b, out):
    a = cv.imread(a)
    b = cv.imread(b)
    a_b = cv.absdiff(a, b)
    cv.normalize(a_b, a_b, 0, 255, cv.NORM_MINMAX)
    cv.imwrite(out, a_b)


diff('./seq.png', './wasm.png', 'diff_seq_wasm.png')
diff('./seq_lookup.png', './wasm_lookup.png', 'diff_seq_lookup_wasm_lookup.png')

#diff('./seq.png', './wasm_simd_expl.png', 'diff_seq_wasm_simd_expl.png')
diff('./seq_lookup.png', './wasm_simd_expl_lookup.png',
     'diff_seq_lookup_wasm_simd_expl_lookup.png')

diff('./seq.png', './gpu.png', 'diff_seq_gpu.png')
diff('./seq_lookup.png', './gpu_lookup.png', 'diff_seq_lookup_gpu_lookup.png')

diff('./seq.png', './workers.png', 'diff_seq_workers.png')

diff('./seq.png', './seq_lookup.png', 'diff_seq_seq_lookup.png')

diff('./gpu.png', './gpu_lookup.png', 'diff_gpu_gpu_lookup.png')
