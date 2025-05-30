import React from "react";
import { Box, Badge, Avatar } from "@mui/material";

export function NotificationBadge({ count }: { count: number }) {
  return (
    <Badge
      badgeContent={count}
      color="error"
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Avatar
        src="/outlook-icon.png"
        alt="Outlook"
        sx={{ width: 40, height: 40 }}
      />
    </Badge>
  );
} 