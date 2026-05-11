import main from '../windows/main';
import executeSafely from '../helpers/executeSafely';
import source from '../model/source';
import { isWebviewPresent, sendToWebview } from 'sketch-module-web-view/remote'

export function runCommand(context) {
    let threadDictionary = NSThread.mainThread().threadDictionary();

    executeSafely(context, function () {
        // sketch-module-web-view caches the NSPanel under the BrowserWindow's
        // identifier. Read the panel directly: storing the JS BrowserWindow
        // wrapper across menu invocations crashes inside Mocha_getProperty
        // because each invocation runs in its own COScript / JSContext.
        let panel = threadDictionary['frontifymain'];
        if (!panel) {
            main(context, 'artboards');
        } else if (panel.isVisible()) {
            panel.orderOut(null);
        } else {
            panel.makeKeyAndOrderFront(null);
        }
    });
}

export function openCommand(context) {
    executeSafely(context, function () {
        let interval = setInterval(function () {
            if (context.actionContext.document.documentWindow()) {
                clearInterval(interval);
                source.opened().then(function () {
                    refresh();
                });
            }
        }, 200);
    });
}

export function savedCommand(context) {
    executeSafely(context, function () {
        source.saved().then(function () {
            refresh();
        });
    });
}

export function closeCommand(context) {
    executeSafely(context, function () {
        source.closed().then(function () {
            refresh();
        });
    });
}

export function selectionChangedCommand(context) {
    executeSafely(context, function() {
        if (isWebviewPresent('frontifymain')) {
            sendToWebview('frontifymain', 'selectionChanged()');
        }
    });
}

function refresh() {
    if (isWebviewPresent('frontifymain')) {
        sendToWebview('frontifymain', 'refresh()');
    }
}
