import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #f4b178 0%, #d38656 100%)",
          color: "white",
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
