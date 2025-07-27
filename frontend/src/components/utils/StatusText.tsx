export const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "DRAFT":
      return "Bản nháp";
    case "INACTIVE":
      return "Tạm dừng";
    case "OVERDUE":
      return "Quá hạn";
    default:
      return status;
  }
};
