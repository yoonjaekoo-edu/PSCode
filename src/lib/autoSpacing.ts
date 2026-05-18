const PARTICLES = "(은|는|을|를|이|가|과|와|아|야|으|이|데|么|边|을|를|은|는|음|응|이|가|과|와|아|야|으|이|데|嘛|么)";
const CONJUNCTIONS = "(그리고|하지만|그래서|그러나|그러므로|따라서|또한|또한|때문|경우|위해|대해|통해|까지|에서|부터|에게|에게|한테|더러|보고|게|과|와|이나|나|랑|이랑|고|고|고)";
const NUMBER_AND_UNIT = /(\d+)(mm|cm|m|kg|원|달러|유로|%|시|분|초|년|월|일|시간|분|초)/gi;

function applySpacing(text: string): string {
  let result = text;

  result = result.replace(/([가-힣])(\d+)/g, "$1 $2");
  result = result.replace(/(\d+)([가-힣])/g, "$1 $2");

  result = result.replace(NUMBER_AND_UNIT, "$1 $2");
  result = result.replace(/ {2,}/g, " ");

  result = result.replace(new RegExp(`(${CONJUNCTIONS})`, "g"), " $1 ");
  result = result.replace(/ {2,}/g, " ");

  result = result.replace(/([\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF])/g, " $1 ");
  result = result.replace(/ {2,}/g, " ");

  result = result.replace(new RegExp(`([가-힣])\\s*${PARTICLES}\\s*([가-힣])`, "gi"), "$1 $2 $3");

  result = result.replace(/([a-zA-Z0-9])([가-힣])/g, "$1 $2");
  result = result.replace(/([가-힣])([a-zA-Z0-9])/g, "$1 $2");

  return result.trim();
}

export function autoSpacing(text: string): string {
  const lines = text.split("\n");
  const spacedLines = lines.map((line) => {
    const codeMatch = line.match(/^(\s*(?:#include|using|int|void|char|double|float|return|if|else|for|while|class|public|private|protected|virtual|override|const|static|namespace|template|typename|try|catch|throw|new|delete|sizeof|typedef|struct|enum|union|explicit|inline|volatile|register|restrict|auto|decltype|noexcept|constexpr|static_cast|dynamic_cast|const_cast|reinterpret_cast|#define|#ifdef|#ifndef|#endif|#else|#elif|import|module|export|asm|inline|mutable|friend|operator)[^\(]*\(.*\)[\s\n]*\{?)/);
    if (codeMatch) {
      return line;
    }
    const hasCodeChars = /[{}\[\];<>]/.test(line);
    if (hasCodeChars) {
      return line;
    }
    return applySpacing(line);
  });

  return spacedLines.join("\n");
}