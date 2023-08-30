# Proprietary implementation of Hough transformation algorithms for selected calculation acceleration methods in JavaScript language environments
Master's thesis and project.

- **Thesis:** [W04_241292_2020_praca magisterska.pdf](https://github.com/damiankoper/js-acceleration/blob/main/docs/out/W04N_241292_2022_praca%20magisterska.pdf)
- **Article:** [Performance Analysis and Comparison of Acceleration Methods in JavaScript Environments Based on Simplified Standard Hough Transform Algorithm](https://link.springer.com/chapter/10.1007/978-3-031-06746-4_13)

### What's in here?

For my Master's thesis, I've implemented popular acceleration methods in JavaScript execution environments. I examined the performance of browser environments of Google Chrome and Mozilla Firefox, as well as the server ones - NodeJS and Deno. The algorithms used for benchmarking were Standard Hough Transform and Circle Hough Transform, which were used for pattern detection in images. Acceleration methods implemented are sequential execution improvement, NodeJS native addons, WebAssembly with asm.js, and SIMD variants. Parallel implemented methods are the usage of Workers and GPU with WebGL API. 

#### Article
A big subset of my studies was described in a conference article published in [New Advances in Dependability of Networks and Systems](https://link.springer.com/book/10.1007/978-3-031-06746-4).

#### Hough Transform
![image](https://github.com/damiankoper/js-acceleration/assets/28621467/12ae700a-ee54-438f-857c-fe1350efac15)
![image](https://github.com/damiankoper/js-acceleration/assets/28621467/fa81be13-d6dc-45e5-8561-4fb46c2c85f4)

#### Results 
The most performant environment is Google Chrome and the last one is Mozilla Firefox. The fastest sequential method is the usage of native addons in NodeJS and the parallel one is WebGL. Summarized results help to choose the most suitable acceleration method for algorithms to be implemented, to be able to compete with other languages' environments, and to create efficient compute-intensive algorithms.
![image](https://github.com/damiankoper/js-acceleration/assets/28621467/1b1ebcdb-d2ed-4691-954d-52dea130a96f)

The repository is configured as monorepo using Lerna. Directories:
* **article** - LaTeX source and output of the article
* **benchmark** - empty directory for local raw benchmark results
* **docs** - LaTeX source and output of the thesis
* **packages** - monorepo packages
  * **benchmark** - benchmark library developed for this project
  * **frontend** - frontend for browser benchmarks
  * **meta** - types and utils shared between packages
  * **test-simple** - web page for algorithm development and verification
  * **js-benchmarks** - automated benchmarks
  * **...rest** - packages implementing algorithms using chosen acceleration methods
* **test** - test resources
