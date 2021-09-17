# Praca magisterska

## Temat w języku polskim
Autorska implementacja algorytmów transformacji Hough'a dla wybranych metod akceleracji obliczeń w środowiskach języka JavaScript.

## Temat w języku angielskim
???(Proprietary/Own)??? implementation of Hough transformation algorithms for selected calculation acceleration methods in JavaScript language environments.

## Aspekt badawczy
1. Propozycja implementacji algorytmów transformacji Hough'a dla wybranych metod akceleracji obliczeń w środowiskach języka JavaScript skupiona na silniku V8.
2. Zbadanie wydajności implementowanych rozwiązań na dostępnym sprzęcie i silnikach JavaScript w testach syntetycznych, jak i z użyciem możliwości przetwarzania obrazu w czasie rzeczywistym w środowisku przeglądarki internetowej.
3. Zbadanie wydajności implementowanych rozwiązań na szerokiej gamie urządzeń i silników JavaScript z użyciem publicznie dostępnej strony internetowej.

Spodziewane rezultaty:
1. Uzyskanie różnych wersji implementowanego algorytmu z różnym stopniem możliwej akceleracji obliczeń dla różnych wariantów transformacji Hough'a i metod akceleracji.
2. Relatywne porównanie wydajności metod akceleracji na różnych platformach.

## Aspekt inżynierski
1. Implementacja algorytmu transformacji Hough'a w wybranych wariantach i z użyciem wybranych metod akceleracji w środowiskach języka JavaScript. 
2. Stworzenie modułowego środowiska, przeprowadzającego testy wydajności dla różnych wariantów algorytmów uruchamianych w różnych środowiskach. 


## Literatura
* P. Mukhopadhyay, B B. Chaudhuri, A survey of Hough Transform, Pattern Recognition 48, 2015, s. 993–1010
* A. Jangda, Not So Fast: Analyzing the Performance of WebAssembly vs. Native Code, 2019, USENIX Annual Technical Conference
*  D. Herrera, Numerical Computing on the Web: Benchmarking for the Future, 2018 53(8) s. 88-100
*  P. J. Fleming, J. J. Wallace, How not to lie with statistics: The correct way to summarize benchmark results, 1986, Communications of the ACM
*  F. Sapuan, General-Purpose Computation on GPUs in the Browser using gpu.js, 2018

## Zadania do wykonania
1. Opracowanie środowiska pomiaru wydajności dla środowisk wykonywalnych języka JavaScript z modułową architekturą pozwalającą na pomiary dla różnych scenariuszy.
2. Implementacja algorytmów z użyciem wybranych metod akceleracji.
3. Test poprawności zaimplementowanych algorytmów.
4. Przeprowadzanie pomiarów na własnym sprzęcie i w możliwie dużej skali.
5. Opracowanie wyników.