(window.onload = () => {
    const mainButtons = document.querySelectorAll('.mainButton');
    const hiddenBlocks = document.querySelectorAll('.hidden');

    mainButtons.forEach(button => {
        button.addEventListener('click', () => {
            let buttonId = button.id;
            let blockId = buttonId.replace('Button','');

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
}) ()

function parseKeySARC(keyText) {
    let objKey = {};
    let lines = keyText.replaceAll('\n','').replaceAll(' ','').split(',');
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
