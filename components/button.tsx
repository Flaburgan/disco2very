import React, { JSX } from "react";
import { cx } from "../lib/cx";

interface Props {
  minimal?: boolean;
  big?: boolean;
  small?: boolean;
  disabled?: boolean;
  animated?: boolean;
  onClick: () => void;
  children: JSX.Element;
}

export default function Button(props: Props) {
  const {
    minimal = false,
    big = false,
    small = false,
    disabled = false,
    animated = false,
    onClick,
    children,
  } = props;

  return (
    <button
      onClick={onClick}
      className={cx("button", { minimal, big, small, animated })}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
