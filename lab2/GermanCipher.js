class GermanCipher {
    constructor() {
        this.sequence = "adfgvx";
        this.allSymbols = "abcdefghijklmnopqrstuvwxyz1234567890";

        this.replacementTable = [];
        for (let i = 0; i < this.sequence.length; i++) {
            let start = this.sequence.length * i;
            let arr = this.allSymbols.substring(start, start + this.sequence.length).split('');
            this.replacementTable.push(arr);
        }

        this.replacement = {};
        this.reverseReplacement = {};
        for (let i = 0; i < this.replacementTable.length; i++) {
            for (let j = 0; j < this.replacementTable[0].length; j++) {
                this.replacement[this.replacementTable[i][j]] = this.sequence[i] + this.sequence[j];
                this.reverseReplacement[this.sequence[i] + this.sequence[j]] = this.replacementTable[i][j];
            }
        }
    }

    encode(text, key) {
        let encodedText = "";
        let encodedSequence = "";
        text = text.toLowerCase();
        for (let i = 0; i < text.length; i++) {
            if (text[i] in this.replacement) {
                encodedSequence += this.replacement[text[i]];
            }
        }

        let newTable = [key.split('')];
        const rowsCount = Math.ceil(encodedSequence.length / key.length);
        
        for (let i = 0; i < rowsCount; i++) {
            let arr = encodedSequence.substring(i * key.length, i * key.length + key.length).split('');
            newTable.push(arr);
        }

        newTable = sortColumns(newTable);
        for (let j = 0; j < newTable[0].length; j++) {
            for (let i = 1; i < newTable.length; i++) {
                if (newTable[i][j]) encodedText += newTable[i][j];
            }
        }

        return encodedText;
    }

    decode(text, key) {
        text = text.replaceAll(" ", "").toLowerCase();
        
        if (text.length % 2 !== 0) {
            return "Некорректный формат зашифрованного текста";
        }

        const header = key.split('');
        const fullRows = Math.floor(text.length / key.length);
        const remainder = text.length % key.length;

        let columns = header.map((letter, i) => ({
            letter,
            index: i,
            length: i < remainder ? fullRows + 1 : fullRows,
            data: []
        }));

        let sortedColumns = [...columns].sort((a, b) => {
            if (a.letter !== b.letter) return a.letter < b.letter ? -1 : 1;
            return a.index - b.index;
        });

        let start = 0;
        for (let col of sortedColumns) {
            col.data = text.slice(start, start + col.length).split('');
            start += col.length;
        }

        let restoredTable = Array(key.length);
        for (let col of sortedColumns) {
            restoredTable[col.index] = col.data;
        }

        let rowsCount = fullRows + (remainder > 0 ? 1 : 0);
        let encodedSequence = "";
        for (let i = 0; i < rowsCount; i++) {
            for (let col = 0; col < key.length; col++) {
                if (i < restoredTable[col].length) {
                    encodedSequence += restoredTable[col][i];
                }
            }
        }

        let decodedText = "";
        for (let i = 0; i < encodedSequence.length; i += 2) {
            const pair = encodedSequence.substring(i, i+2);
            if (pair in this.reverseReplacement) {
                decodedText += this.reverseReplacement[pair];
            } 
        }

        return decodedText;
    }
}

function sortColumns(matrix) {
    let columnData = [];
    for (let j = 0; j < matrix[0].length; j++) {
        let column = [];
        for (let i = 0; i < matrix.length; i++) {
            column.push(matrix[i][j]);
        }
        columnData.push({ index: j, firstRowValue: matrix[0][j], data: column });
    }

    columnData.sort((a, b) => {
        if (a.firstRowValue !== b.firstRowValue) {
            return a.firstRowValue < b.firstRowValue ? -1 : 1;
        }
        return a.index - b.index;
    });

    let newMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        newMatrix[i] = [];
        for (let j = 0; j < columnData.length; j++) {
            newMatrix[i].push(columnData[j].data[i]);
        }
    }
    return newMatrix;
}
