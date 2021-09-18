* Webpack w trybie devtool: 'eval' wsadza wszystko w eval - jeśli budujemy sub-bibliotekę w trybie dev to zawiera ona również webpackowe helpery, które próbują się wykonać w złym kontekście 
  * https://github.com/webpack/webpack/issues/11277
  * https://stackoverflow.com/questions/69087668/bundle-webpack-react-library-as-an-esm-module-object-defineproperty-called-on/69200112#69200112
* Lerna przy lerna run build wykonuje skrypt we właściwej kolejności związanej z wzajemną zależnością pakietów
* test-simple
  * Pobieranie pixeli poprzez rysowanie na canvas jest niedokładne, ponieważ obraz jest wygładzany, opcja `context.imageSmoothingEnabled` temu zapobiega
* Memory requirement of the accumulator array is reduced to 59% when the image center, instead of corner, is used as the origin.
* Math.max i Math.min crashują przy dużych tablicach - przepełnienie stosu, wartości są argumentami funkcji