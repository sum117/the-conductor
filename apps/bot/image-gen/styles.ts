import React from "react";

export const mainStyle: React.CSSProperties = {
  display: "flex",
  padding: "1rem",
  flexDirection: "column",
  borderRadius: "8px",
  rowGap: "1rem",
  backgroundImage: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
  alignItems: "flex-start",
};
export const textShadowStyle: React.CSSProperties = {
  filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
};
export const boxShadowStyle: React.CSSProperties = {
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};
export const titleStyle: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: "0.5rem",
  margin: 0,
  fontWeight: "bold",
  color: "white",
};
export const statsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "15rem",
  paddingLeft: "2rem",
  color: "white",
  fontSize: "1.25rem",
  ...textShadowStyle,
};
export const aboutStyle: React.CSSProperties = {
  alignItems: "center",
  textTransform: "uppercase",
  color: "white",
  fontSize: "1.25rem",
  ...textShadowStyle,
};
export const featuredImageStyle: React.CSSProperties = {
  ...boxShadowStyle,
  objectFit: "cover",
  objectPosition: "top",
  borderRadius: "8px",
};
