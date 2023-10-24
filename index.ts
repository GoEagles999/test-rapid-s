import * as fs from 'fs';
import * as crypto from 'crypto';

class FS {
  dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  readFiles(
    dirname: string,
    onFileContent: (fname, content, res) => void,
    onError: (e) => void
  ) {
    return new Promise((res, rej) => {
      fs.readdir(dirname, function (err, filenames) {
        if (err) {
          onError(err);
          rej(err);
          return;
        }
        filenames.forEach(function (filename) {
          try {
            const content = fs.readFileSync(dirname + filename, 'utf-8');
            onFileContent(filename, content, res);
          } catch (e) {
            onError(e);
          }
        });
        res(true);
      });
    });
  }

  async store(filename: string, contentToSave: String) {
    return new Promise(async (resStore, rejStore) => {
      let matchedFname = false;
      const hash = crypto
        .createHash('md5')
        .update(Buffer.from(contentToSave))
        .digest('hex')
        .toString();
      const onF = async (fname, fileContent, res) => {
        console.log(fname);
        const hashedFileContent = crypto
          .createHash('md5')
          .update(fileContent)
          .digest('hex')
          .toString();
        if (hash == hashedFileContent) {
          matchedFname = fname;
          res(fname);
        }
      };
      const onE = (e) => {};
      try {
        const f = await this.readFiles(this.dir, onF, onE);
        if (matchedFname) {
          await fs.promises.symlink(
              `${this.dir}${matchedFname}`,
              `${this.dir}${filename}`
          );
          resStore(true);
        } else {
          fs.writeFileSync(
            `${this.dir}${filename}`,
            Buffer.from(contentToSave),
            {}
          );
          resStore(true);
        }
      } catch (e) {
        rejStore(e);
      }
    });
  }

  get(filename: string) {
    const d = fs.readFileSync(`${this.dir}${filename}`).toString();
    return d;
  }
}

(async () => {
  const fsObj = new FS('/Users/richarddemeny/Desktop/rapids/');
  await fsObj.store('filename1', 'a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1');
  await fsObj.store('filename2', 'a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1a very long string1');
  await fsObj.store('filename3', 'a very long string3');
  await fsObj.store('filename4', 'a very long string3');
  await fsObj.store('filename5', 'a very long string2');
  const result1 = fsObj.get('filename1'); // gets 'a very long string1'
  const result2 = fsObj.get('filename2'); // gets 'a very long string1'
  const result3 = fsObj.get('filename3'); // gets 'a very long string3'
  console.log('asdf')
  console.log(result1);
  console.log(result2);
  console.log(result3);
})();
