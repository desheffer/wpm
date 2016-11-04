(function($) {
    'use strict';

    window.WPM = window.WPM || {};

    window.WPM.gameModes = {
        IDLE: 'idle',
        PREGAME: 'pregame',
        PLAYING: 'playing',
        POSTGAME: 'postgame',
    };

    window.WPM.Game = function() {
        var that = this;

        var modes = window.WPM.gameModes;
        var timer;

        // Current game mode.
        var mode;

        // Start time for the current game.
        var startTime;

        // Name of the current word set.
        var wordSetName;

        // Text that has been correctly typed.
        var correctlyTyped;

        // Text that has been incorrectly typed.
        var incorrectlyTyped;

        // Text that has not yet been correctly typed.
        var notYetTyped;

        // Count of all letter presses for the current game.
        var totalTyped;

        // Log of all correct letter presses.
        var times;

        function currentMode() {
            var hasText = notYetTyped !== undefined && notYetTyped.length > 0;

            if (hasText && startTime === undefined) {
                return modes.PREGAME;
            } else if (hasText && startTime !== undefined) {
                return modes.PLAYING;
            } else if (!hasText && startTime !== undefined) {
                return modes.POSTGAME;
            }

            return modes.IDLE;
        }

        function tick() {
            clearInterval(timer);
            timer = undefined;

            var oldMode = mode;
            mode = currentMode();

            // Trigger the score change event when the game mode is PLAYING or
            // has just changed from PLAYING.
            if (oldMode === modes.PLAYING || mode === modes.PLAYING) {
                var seconds = ($.now() - startTime) / 1000;
                var characters = correctlyTyped.length;
                var words = correctlyTyped.length / 5;
                var wpm = words / (seconds / 60);
                var accuracy = characters / totalTyped * 100;

                $(that).trigger({
                    type: 'scorechange.wpm',
                    mode: mode,
                    seconds: seconds,
                    characters: characters,
                    words: words,
                    wpm: wpm,
                    accuracy: accuracy,
                    wordSetName: wordSetName,
                    times: times,
                });
            }

            // Trigger the mode change event.
            if (mode !== oldMode) {
                $(that).trigger({
                    type: 'modechange.wpm',
                    mode: mode,
                    oldMode: oldMode,
                });
            }

            if (mode === modes.PREGAME || oldMode === modes.PREGAME) {
                $(that).trigger({
                    type: 'textchange.wpm',
                    mode: mode,
                    correctlyTyped: correctlyTyped,
                    incorrectlyTyped: incorrectlyTyped,
                    notYetTyped: notYetTyped,
                    nextLetter: notYetTyped[0],
                    change: 0,
                });
            }

            if (mode === modes.PLAYING) {
                timer = setTimeout(tick, 100);
            }
        }

        this.init = function() {
            if (mode !== undefined) {
                return;
            }

            tick();
        };

        this.changeWordList = function(name, wordList) {
            startTime = undefined;

            wordSetName = name;
            notYetTyped = wordList;
            correctlyTyped = incorrectlyTyped = '';
            totalTyped = 0;
            times = [];

            tick();
        };

        this.start = function() {
            if (mode !== modes.PREGAME) {
                return;
            }

            startTime = $.now();
            tick();
        };

        this.letterTyped = function(letter) {
            if (mode === modes.PREGAME) {
                this.start();
                return;
            }

            if (mode !== modes.PLAYING) {
                return;
            }

            totalTyped++;
            var delta = 0;
            var expected = notYetTyped.substr(0, 1);

            if (incorrectlyTyped.length === 0 && letter === expected) {
                // Add a correct letter
                correctlyTyped = correctlyTyped + letter;
                notYetTyped = notYetTyped.substr(1);
                delta = 1;

                var lastLetterTime = times.length > 0 ? times[times.length - 1].time : startTime;
                var newLetterTime = $.now();
                times.push({
                    letter: letter,
                    time: newLetterTime,
                    duration: newLetterTime - lastLetterTime,
                });
            } else if (incorrectlyTyped.length <= 10) {
                // Add an incorrect letter
                incorrectlyTyped = incorrectlyTyped + letter;
            } else {
                return;
            }

            $(that).trigger({
                type: 'textchange.wpm',
                mode: mode,
                correctlyTyped: correctlyTyped,
                incorrectlyTyped: incorrectlyTyped,
                notYetTyped: notYetTyped,
                nextLetter: incorrectlyTyped ? false : notYetTyped[0],
                change: delta,
            });

            tick();
        };

        this.backspaceTyped = function() {
            if (mode !== modes.PLAYING) {
                return;
            }

            var delta = 0;

            if (incorrectlyTyped.length > 0) {
                // Remove an incorrect letter
                incorrectlyTyped = incorrectlyTyped.substr(0, incorrectlyTyped.length - 1);
            } else if (correctlyTyped.length > 0) {
                // Remove a correct letter
                notYetTyped = correctlyTyped[correctlyTyped.length - 1] + notYetTyped;
                correctlyTyped = correctlyTyped.substr(0, correctlyTyped.length - 1);
                delta = -1;

                times.pop();
            } else {
                return;
            }

            $(that).trigger({
                type: 'textchange.wpm',
                mode: mode,
                correctlyTyped: correctlyTyped,
                incorrectlyTyped: incorrectlyTyped,
                notYetTyped: notYetTyped,
                nextLetter: incorrectlyTyped ? false : notYetTyped[0],
                change: delta,
            });

            tick();
        };
    };
})(jQuery);
