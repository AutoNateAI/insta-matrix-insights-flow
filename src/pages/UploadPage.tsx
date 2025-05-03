
import DashboardLayout from '@/components/DashboardLayout';
import FileUploader from '@/components/FileUploader';

const UploadPage = () => {
  return (
    <DashboardLayout title="Upload Data">
      <div className="max-w-3xl mx-auto">
        <FileUploader />
        
        <div className="mt-8 dashboard-card">
          <h2 className="card-title">Data Format Requirements</h2>
          <div className="space-y-4">
            <p className="text-sm">
              Your JSON file should contain an array of Instagram post objects with the following structure:
            </p>
            
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`[
  {
    "inputUrl": "https://www.instagram.com/example",
    "id": "123456789",
    "type": "Image",
    "shortCode": "AbCdEfG",
    "caption": "Post caption text",
    "hashtags": ["tag1", "tag2"],
    "mentions": ["@user1", "@user2"],
    "url": "https://www.instagram.com/p/AbCdEfG/",
    "commentsCount": 42,
    "firstComment": "Great post!",
    "latestComments": [
      {
        "id": "comment123",
        "text": "Love this!",
        "ownerUsername": "commenter1",
        "timestamp": "2024-04-20T15:30:25.000Z",
        "repliesCount": 0,
        "replies": [],
        "likesCount": 2,
        "owner": {
          "id": "123456",
          "is_verified": false,
          "username": "commenter1"
        }
      }
    ],
    "likesCount": 250,
    "timestamp": "2024-04-20T10:45:31.000Z",
    "childPosts": [],
    "ownerFullName": "Account Name",
    "ownerUsername": "account_handle",
    "ownerId": "7475561307",
    "isSponsored": false,
    "taggedUsers": []
  }
]`}
            </pre>
            
            <h3 className="text-lg font-medium mt-6">Preparation Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Ensure your JSON is properly formatted and valid</li>
              <li>The file must contain an array of post objects at the root level</li>
              <li>Each post should include all the required fields shown above</li>
              <li>Timestamps should be in ISO 8601 format</li>
              <li>Maximum recommended file size: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
