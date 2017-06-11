{
    'targets': [{
        'target_name':
        'node_ctp',
        'sources': [
            'src/addon.cc',
            'src/ctp_md.cc',
            'src/ctp_td.cc',
        ],
        'include_dirs': [
            '<(module_root_dir)/ctp_api/include',
        ],
        'conditions': [[
            'OS=="linux"', {
                'cflags': ['-std=c++11'],
                'libraries': [
                    '<(module_root_dir)/ctp_api/lib/libthostmduserapi.so',
                    '<(module_root_dir)/ctp_api/lib/libthosttraderapi.so',
                ]
            }
        ]]
    }]
}
