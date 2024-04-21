export const decodeFloat = ({
  decimal,
  value
}: {
  decimal: number;
  value: bigint;
}): number => {
  if (decimal == 0) {
    return Number(value);
  }
  return parseFloat(
    `${value.toString().slice(0, decimal)}.${value.toString().slice(decimal)}`
  );
};

export const encodeFloat = (number: number) => {
  const dec = number.toString().indexOf('.');
  return {
    decimal: dec != -1 ? dec : 0,
    value: BigInt(number.toString().replace('.', ''))
  };
};
