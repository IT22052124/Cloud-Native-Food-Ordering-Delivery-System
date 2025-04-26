const NotificationList = ({ notifications, onApprove, onReject }) => {
    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    );
  };


export default NotificationList;