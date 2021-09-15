* Webpack w trybie devtool: 'eval' wsadza wszystko w eval - jeśli budujemy sub-bibliotekę w trybie dev to zawiera ona również webpackowe helpery, które próbują się wykonać w złym kontekście 
  * https://github.com/webpack/webpack/issues/11277
  * https://stackoverflow.com/questions/69087668/bundle-webpack-react-library-as-an-esm-module-object-defineproperty-called-on/69200112#69200112