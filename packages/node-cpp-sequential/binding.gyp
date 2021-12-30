{
  'targets': [
    {
      'target_name': 'node-cpp-sequential-native',
      'sources': [ 'src/js_cpp_sequential.cc' ],
      'include_dirs': [
        "<!@(node -p \"require('node-addon-api').include_dir\")", 
        "<!@(node -p \"require('cpp-sequential').include_dir\")"
      ],
      'libraries': [ 
        "-lsht-sequential", 
        "-L<!@(node -p \"require('cpp-sequential').library_dir\")"
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
    }
  ]
}
