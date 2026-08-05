declare module "moment-hijri" {
  interface HijriMoment {
    iYear(): number;
    iMonth(): number;
    iDate(): number;
  }

  type MomentHijriFactory = (date?: Date | string | number) => HijriMoment;

  const momentHijri: MomentHijriFactory;
  export default momentHijri;
}