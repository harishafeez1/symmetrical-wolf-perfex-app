export const EditorOption = {
        mode: "textareas",
        base_url: '/assets/plugins/tinymce', // Root for resources
        content_style: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "body { background: #2e344e; }" : "body { background: #fff; }"),
        inline_boundaries: true,
        // suffix: '.min',
        branding: false,
        browser_spellcheck: true,
        height: 300,
        relative_urls: false,
        inline_styles: true,
        verify_html: false,
        cleanup: false,
        autoresize_bottom_margin: 25,
        valid_elements: '+*[*]',
        valid_children: '+body[style], +style[type]',
        apply_source_formatting: false,
        remove_script_host: false,
        removed_menuitems: 'newdocument restoredraft',
        forced_root_block: 'p',
        statusbar: false,
        autosave_restore_when_empty: false,
        fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
        table_default_styles: {
        width: '100%',
        },
        toolbar1: 'fontselect fontsizeselect | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | image link | bullist numlist | restoredraft',
        contextmenu: "link image inserttable | cell row column deletetable | paste"
}