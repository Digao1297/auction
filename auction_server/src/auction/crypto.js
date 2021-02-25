import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const algorithm = "aes-256-ctr";
const binaryLike = randomBytes(16);
const cipherKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";

export const encrypt = (message) => {
  const cipher = createCipheriv(algorithm, cipherKey, binaryLike);

  const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);

  return Buffer.from(
    JSON.stringify({
      binaryLike: binaryLike.toString("hex"),
      content: encrypted.toString("hex"),
    })
  );
};

export const decrypt = (hash) => {
  const { binaryLike, content } = JSON.parse(hash);

  const decipher = createDecipheriv(
    algorithm,
    cipherKey,
    Buffer.from(binaryLike, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString("utf-8");
};
