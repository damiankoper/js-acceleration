cmake_minimum_required(VERSION 3.0.0)
project(cpp-sequential VERSION 0.1.0)

set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

include(CTest)
enable_testing()

include_directories(include)

add_library(sht 
    src/SHTSimple.cpp 
    src/SHTSimpleLookup.cpp
)

add_library(cht 
    src/CHTSimple.cpp 
)

add_executable(sht-test-raw test/testRawSHT.cpp)
add_executable(cht-test-raw test/testRawCHT.cpp)
target_link_libraries(sht-test-raw sht)
target_link_libraries(cht-test-raw cht)

add_executable(threshold benchmark/threshold.cpp)
target_link_libraries(threshold Threads::Threads)
target_link_libraries(threshold benchmark)
target_link_libraries(threshold sht)
target_link_libraries(threshold cht)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
