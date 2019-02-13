## Introduction
Wspy is a conditional log system that enrich your logging events with stack-traces, timing, and memory info.
At debug time, you can query and filter the wspy logs from the debug console using the `wspy.search(...)` command.

wSpy is highly effective in the following cases:
* debugging complex aynch interactions. E.g, reactive systems, drag & drop, rxjs, and request queues
* understanding/debugging frameworks that takes control of the flow like react, angular, redux, mobx, IOC etc
* understanding/monitoring the flow and timing issues of large/complex systems

wSpy logs are conditional.
wSpy logs requests are ignored when there is no `&wspy=` param in the url.
wSpy does not log a record if the log name is not in the url `&wpy=` param or explicitly defined in the `includeLogs` settings.

When logged, log events are enriched with the following data:
* Log index (used to merge logs)
* Memory usage
* stacktrace (source)
* Time stamp

wSpy can work in a browser and also supports nodeJs and worker hosts.

## Getting Started:
1. Add wSpy to your project:  
    ```
    $ npm i --save wspy
    ```
    or:
    ```
    $ yarn add wspy
    ```
2. Require `wSpy` in your file and initialize it:  
    ```
    const wSpy = require('wspy').initBrowserHost({ includeLogs: 'myLog' })
    ```
3. Log your app events:
    ```
    wSpy.log('myLog', [functionName, ...arguments])
    ```

## Settings
Define in your code the settings for wSpy config. If not defined, wSpy would use it own default config:
```
{
    includeLogs: '',             // Default logs for wSpy. Must define it when initiating!
    moreLogs: '',                // Logs that would only work if defined in wSpy param
    MAX_LOG_SIZE: 10000,         // Maximum log size for each log. When reached, wSpy slice the log by half.
    stackFilter: /wSpy/i         // Stacktrace filter using regex. Recommended when working with minified libraries: react-dom, require.min.js etc.
}
```

In your code, define your overrided settings, for example:
```
const wSpySettings = {
    includeLogs: 'actionRunner,message-in',
    moreLogs: 'dragAndDrop,redux-dispatch,react-render',
    stackFilter: /wSpy|react-dom/i
}
```
#### Browser host
wSpy is activated only if you have `&wSpy=` param in your url. Optional logs are put in setting `moreLogs`, for example:  

```
wSpy=dragAndDrop
```

The logs in the url 

You can also omit some logs with `-logName`:

```
wSpy=myLog1,-actionRunner
```
Initiate with:

```
const wSpy = require('wspy').initBrowserHost({ settings })
```

## Debugging with the debug console
When the app is running you can open the debug console (we use chrome) and interact with wSpy
#### API
* Search (filter) all logs:
  - `wSpy.search('layout')` - would return any logs with layout mention (logNames, stacktraces)
  - `wSpy.search(/layout|render/)` - search supports also regexes
* Show all logs together: `wSpy.merged()`
* Clear all logs: `wSpy.clear()`
* Show specific log: `wSpy.logs.myLog`

#### Logging specific activity
To log a specific activity, e.g, dragging 
* use `wSpy.clear()` 
* do the activity - drag the mouse
* see the logs

## Logging registered callback functions:
Callback functions are used in almost any js framework.
However, when the callback function is activated, the execution stack does not show the context in which the function was registered.
To solve this issue, wSpy enriches the execution record with the registration stack.
To make it happen, you need to use `wSpy.logCallBackRegistration` and `wSpy.logCallBackExecution` as shown in the exmaple below and add it the framework you want to debug.
```
{
    register(myFunc) {
        wSpy.logCallBackRegistration(myFunc, 'register', [])
        this.callback = myFunc
    }
    
    exec() {
        wSpy.logCallBackExecution(this.callback, 'exec', [])
        this.callback()
    }
}
```

## More Hosts
#### Node:
In node host you will need to take the `&wspy` param from the command line arguments:
```
function getProcessArgument(argName) {
  for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg.indexOf('-' + argName + ':') == 0) 
      return arg.substring(arg.indexOf(':') + 1);
    if (arg == '-' + argName) return true;
  }
  return '';
}

const wSpyParam = getProcessArgument('wspy')
```
Initiate wSpy:
```
const wSpy = require('wspy').initNodeHost({ settings, wSpyParam })
```

#### Worker:
Worker host is a bit tricky, you will need to pass the wSpyParam to the worker and then initialize wSpy:
Initiate wSpy:
```
const wSpy = require('wspy').initWorkerHost({ settings, wSpyParam })
```

## Troubleshooting
When there is no `&wspy=` param, wspy is set to `noopSpy` - in this mode it completely ignores all log requests.

Keep `moreLogs` updated. This way you will be able to keep track of all the available logs.

You can log anything, `making a lot of logs will not slow your system`. However `make sure you activate just the logs you need` in the url.

## Contributing
Contributing are always welcome.
- Add an issue to [issues](https://github.com/wix-incubator/wSpy/issues)
- Fork wSpy and make pull request for us
- Please add tests, the package should always remain 100% covered with tests
