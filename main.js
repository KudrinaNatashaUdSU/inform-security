window.onload = () => {
    const mainButtons = document.querySelectorAll('.mainButton');
    const hiddenBlocks = document.querySelectorAll('.hidden');

    mainButtons.forEach(button => {
        button.addEventListener('click', () => {
            let buttonId = button.id;
            let blockId = buttonId.replace('Button', '');

            hiddenBlocks.forEach(block => {
                block.classList.add('hidden');
            });

            document.getElementById(blockId).classList.remove('hidden');
        });
    });

    const actionSARCButtons = document.querySelectorAll('.action.SARC');

    actionSARCButtons.forEach(button => {
        button.addEventListener('click', () => {
            let buttonId = button.id;
            let text = document.getElementById('textSARC').value;
            let key = document.getElementById('keySARC').value;
            const language = getLanguage(text);

            if (!language) {
                document.getElementById('textSARC').value = 'Используйте английский или русский алфавит!'
            }
            else {
                const sarc = new SingleAlphabetReplacementCipher(language);
                if (buttonId === 'encodeSARC') {
                    document.getElementById('resultSARC').value = sarc.encode(text, parseKeySARC(key));
                } else if (buttonId === 'decodeSARC') {
                    document.getElementById('resultSARC').value = sarc.decode(text, parseKeySARC(key));
                } else {
                    document.getElementById('resultSARC').value = sarc.break(text);
                }
            }
        });
    });

    const actionGermanCipherButtons = document.querySelectorAll('.action.germanCipher');

    actionGermanCipherButtons.forEach(button => {
        button.addEventListener('click', () => {
            let buttonId = button.id;
            let text = document.getElementById('textGermanCipher').value;
            let key = document.getElementById('keyGermanCipher').value;

            if (!hasOnlyEnglish(text)) {
                document.getElementById('textGermanCipher').value = 'Используйте английский алфавит!'
            }
            else {
                const gc = new GermanCipher();
                if (buttonId === 'encodeGermanCipher') {
                    document.getElementById('resultGermanCipher').value = gc.encode(text, key);
                } else if (buttonId === 'decodeGermanCipher') {
                    document.getElementById('resultGermanCipher').value = gc.decode(text, key);
                }
            }
        });
    });

    const actionRC5Buttons = document.querySelectorAll('.action.RC5');

    actionRC5Buttons.forEach(button => {
        button.addEventListener('click', () => {
            const rc5 = new RC5();
            let buttonId = button.id;
            let text = document.getElementById('textRC5').value;
            document.getElementById('keyRC5').value = rc5.randomKey();
            
            if (buttonId === 'encodeRC5') {
                document.getElementById('resultRC5').value = rc5.encode(text, document.getElementById('keyRC5').value);
            } else if (buttonId === 'decodeRC5') {
                document.getElementById('resultRC5').value = rc5.decode(text, document.getElementById('keyRC5').value);
            }

        });
    });

    const actionStreamCipherButtons = document.querySelectorAll('.action.streamCipher');
    actionStreamCipherButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sc = new StreamCipherWithRC5();
            let buttonId = button.id;
            let text = document.getElementById('textStreamCipher').value;
            document.getElementById('keyStreamCipher').value = new RC5().randomKey();
            
            if (buttonId === 'encodeStreamCipher') {
                document.getElementById('resultStreamCipher').value = sc.encode(text, document.getElementById('keyStreamCipher').value);
            } else if (buttonId === 'decodeStreamCipher') {
                document.getElementById('resultStreamCipher').value = sc.decode(text, document.getElementById('keyStreamCipher').value);
            }

        });
    });
}

function parseKeySARC(keyText) {
    let objKey = {};
    let lines = keyText.replaceAll('\n', '').replaceAll(' ', '').split(',');
    for (let line of lines) {
        let pair = line.split(':');
        objKey[pair[0]] = pair[1];
    }
    return objKey;
}

function getLanguage(text) {
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasRussian = /[а-яА-ЯёЁ]/.test(text);
    if (hasEnglish && !hasRussian) return 'en';
    else if (!hasEnglish && hasRussian) return 'rus'
    else return null;
}

function hasOnlyEnglish(text) {
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasRussian = /[а-яА-ЯёЁ]/.test(text);
    return hasEnglish && !hasRussian;
}
