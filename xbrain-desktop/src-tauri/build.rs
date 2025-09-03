use std::{fs, path::Path};

fn ensure_icon() {
  let icon_dir = Path::new("icons");
  let icon_path = icon_dir.join("icon.ico");
  if icon_path.exists() {
    return;
  }
  let _ = fs::create_dir_all(icon_dir);
  // Create a 64x64 transparent icon as a placeholder
  let mut image = image::RgbaImage::new(64, 64);
  // simple X pattern
  for i in 0..64 {
    let c = image::Rgba([0u8, 120u8, 255u8, 255u8]);
    image.put_pixel(i, i, c);
    image.put_pixel(63 - i, i, c);
  }
  let dyn_img = image::DynamicImage::ImageRgba8(image);
  let ico_image = ico::IconImage::from_rgba_data(64, 64, dyn_img.to_rgba8().into_raw());
  // save ico
  let mut icon_dir = ico::IconDir::new(ico::ResourceType::Icon);
  icon_dir.add_entry(ico::IconDirEntry::encode(&ico_image).expect("encode ico"));
  let mut icon_dir_writer = std::fs::File::create(&icon_path).expect("failed to create icon.ico");
  icon_dir.write(&mut icon_dir_writer).expect("failed to write ico");
}

fn main() {
  ensure_icon();
  tauri_build::build()
}
