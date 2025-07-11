import * as React from "react"
import type { SVGProps } from "react"

interface SidebarIconProps extends SVGProps<SVGSVGElement> {
  open?: boolean;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ open, ...props }) => {
  return (
    <svg
      {...props}
      className={`${props.className || ""}`.trim()}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z"></path>
      {open === true && (
        <path d="M3 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"></path>
      )}
    </svg>
  );
};

export default SidebarIcon;
