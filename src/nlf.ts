import { basename, extname } from 'path';
import { TextEditor } from 'atom';
import NLF from '@nsis/nlf';

async function convert(): Promise<void> {
  const editor: TextEditor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    atom.beep();
    return;
  }

  switch (editor.getGrammar().scopeName) {
    case 'source.nlf':
      await convertNLF(editor);
      break;

    case 'source.json':
    case 'source.json5':
      await convertJSON(editor);
      break;

    default:
      atom.beep();
      break;
  }
}

async function convertNLF(editor): Promise<void> {
  let output;

  try {
    const input = editor.getText();
    output = NLF.parse(input, { stringify: true });
  } catch (e) {
    console.error(e);
    atom.notifications.addError('Conversion Failed', {detail: e, dismissable: true});

    return;
  }

  await openNewFile(editor, output, 'json');
}

async function convertJSON(editor: TextEditor): Promise<void> {
  let output;

  try {
    const input = editor.getText();
    output = NLF.stringify(input);
  } catch (e) {
    console.error(e);
    atom.notifications.addError('Conversion Failed', {detail: e, dismissable: true});

    return;
  }

  await openNewFile(editor, output, 'nlf');
}

async function openNewFile(editor: any, input: string, targetExt: string): Promise<void> {
  let newEditorTab;

  // eslint-disable-next-line
  const fileName = editor.getFileName().toString();
  const newFileName = basename(fileName, extname(fileName));


  try {
    newEditorTab = await atom.workspace.open(`${newFileName}.${targetExt}`, {
      pending: true
    });
  } catch (error) {
    console.error(error);
    atom.notifications.addError(error, {dismissable: true});

    return;
  }

  newEditorTab.setText(input);
}

export {
  convert
}
