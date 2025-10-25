class SingleAlphabetReplacementCipher {
    constructor(language = "en") {
        if (language === "en") {
            this.frequency = {
                "e": 12.7, "t": 9.06, "a": 8.17, "o": 7.51, "i": 6.97, 
                "n": 6.75, "s": 6.33, "h": 6.09, "r": 5.99, "d": 4.25,
                "l": 4.03, "c": 2.78, "u": 2.76, "m": 2.41, "w": 2.36,
                "f":2.23, "g":2.02, "y": 1.97, "p": 1.93, "b": 1.49, 
                "v": 0.98, "k": 0.77, "x": 0.15, "j": 0.15, "q": 0.1, "z": 0.05
            };
        } else {
            this.frequency = {
                "о": 10.97, "е": 8.45, "а": 8.01, "и": 7.35,
                "н": 6.7, "т": 6.26, "с": 5.47, "р": 4.73,
                "в": 4.54, "л": 4.4, "к": 3.49, "м": 3.21,
                "д": 2.98, "п": 2.81, "у": 2.62, "я": 2.01,
                "ы": 1.9, "ь": 1.74, "г": 1.7, "з": 1.65,
                "б": 1.59, "ч": 1.44, "й": 1.21, "х": 0.97,
                "ж": 0.94, "ш": 0.73, "ю": 0.64, "ц": 0.48,
                "щ": 0.36, "э": 0.32, "ф": 0.26, "ъ": 0.04, "ё": 0.04
            };
        }
    }

    encode(text, key) { 
        text = text.toLowerCase();
        let encodedText = "";
        for (let i = 0; i < text.length; i++) {
            let symbol = text[i];
            if (symbol in key) {
                encodedText += key[symbol];
            }
            else encodedText += symbol;
        }
        return encodedText;
    }

    decode(text, key) { 
        text = text.toLowerCase();
        let decodedText = "";
        const letters = Object.keys(key);
        let addedCount = 0;
        for (let i = 0; i < text.length; i++) {
            let symbol = text[i];
            for (let j = 0; j < letters.length; j++) {
                if (key[letters[j]] === symbol) {
                    decodedText += letters[j];
                    addedCount++;
                    break;
                }
            }
            if (addedCount != i+1) {
                decodedText += symbol;
                addedCount++;
            }
        }
        return decodedText;
    }

    break(text) { 
        text = text.toLowerCase();
        var key = {};
        var calculatedFrequency = {};
        var symbolsCount = 0;

        for (let i = 0; i < text.length; i++) {
            var letter = text[i];
            if (letter in this.frequency) {
                if (letter in calculatedFrequency) calculatedFrequency[letter]++;
                else calculatedFrequency[letter] = 1; 
                symbolsCount++;
            }
        }

        let letters = Object.keys(calculatedFrequency);
        let allLetters = Object.keys(this.frequency);
        letters.forEach(letter => {
            calculatedFrequency[letter] *= (100 / symbolsCount);
        });

        let sortedEncodedLetters = letters.sort((a, b) => calculatedFrequency[b] - calculatedFrequency[a]);
        for (let i = 0; i < sortedEncodedLetters.length; i++) {
            let decodedElem = allLetters[i];
            let encodedElem = sortedEncodedLetters[i];
            key[decodedElem] = encodedElem;
        }

        return this.decode(text, key);
    }
}