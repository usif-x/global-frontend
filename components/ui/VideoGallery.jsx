import { Icon } from "@iconify/react";

const VideoGallery = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <Icon icon="mdi:video" className="mr-2 h-6 w-6" />
        Videos
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-video">
              {video.url ? (
                <iframe
                  src={video.url}
                  title={`Video ${index + 1}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Icon
                    icon="mdi:video-off"
                    className="h-12 w-12 text-gray-400"
                  />
                </div>
              )}
            </div>
            {video.title && (
              <div className="p-4">
                <h4 className="font-semibold text-gray-800">{video.title}</h4>
                {video.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {video.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
