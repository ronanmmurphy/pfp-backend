export function getLocationText(
  streetAddress1: string,
  city: string,
  state: string,
  postalCode: string,
  streetAddress2?: string | null,
) {
  const streetAddress = streetAddress2
    ? streetAddress1 + ', ' + streetAddress2
    : streetAddress1;
  return streetAddress + ', ' + city + ', ' + state + ', ' + postalCode;
}
