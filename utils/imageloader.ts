export default function imageloader({
  src,
  width,
  quality,
}: {
  src: string;
  width?: number;
  quality?: number;
}) {
  const params = ['f_auto', 'c_limit', `w_${width || 500}`, `q_${quality || 'auto'}`];
  return `${src}`;
}