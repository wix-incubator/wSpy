module.exports = {
    'plugins': [
        'jasmine'
    ],
    'env': {
        'browser': true,
        'node': true,
        'commonjs': true,
        'es6': true,
        'jasmine': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'rules': {
        'brace-style': 'error',
        'comma-dangle': 'error',
        'comma-spacing': 'error',
        'no-throw-literal': 'error',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'dot-location': 'error',
        'space-in-parens': 'error',
        'space-infix-ops': 'error',
        'no-dupe-args': 'error',
        'no-whitespace-before-property': 'error',
        'no-extra-parens': 'error',
        'no-extra-semi': 'error',
        'semi-spacing': 'error',
        'keyword-spacing': 'error',
        'no-undef': 'error',
        'no-lonely-if': 'error',
        'arrow-parens': [
            'error',
            'as-needed'
        ],
        'handle-callback-err': 'error',
        'no-console': 'off',
        'indent': [
            'error',
            'tab'
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ],

        // Jasmine rules:
        'jasmine/no-focused-tests': 'error',
        'jasmine/valid-expect': 'error',
        'jasmine/no-suite-callback-args': 'error',
        'jasmine/no-disabled-tests': 'error',
        'jasmine/missing-expect': 'error'
    }
}