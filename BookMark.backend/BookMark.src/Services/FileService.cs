public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file, string[] allowedFileExtensions);
    bool ValidateFileSize(IFormFile file, long maxSizeBytes);
    void DeleteFile(string fileNameWithExtension);
}

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;
    
    private const string UPLOADS_FOLDER_NAME = "Uploads";
    private readonly string uploadsPath;

    public FileService(IWebHostEnvironment environment)
    {
        uploadsPath = Path.Combine(environment.ContentRootPath, UPLOADS_FOLDER_NAME);

        _environment = environment;
    }
    

    public async Task<string> SaveFileAsync(IFormFile file, string[] allowedFileExtensions)
    {
        ValidateFileExtension(file.FileName, allowedFileExtensions);

        EnsureDirectoryExists(uploadsPath);

        var fileName = GenerateUniqueFileName(file.FileName);
        var fullPath = Path.Combine(uploadsPath, fileName);
        
        await SaveFileToDisk(file, fullPath);
        return fileName;
    }


    public bool ValidateFileSize(IFormFile file, long maxSizeBytes)
    {
        if (file == null) return false;
        return file.Length <= maxSizeBytes;
    }


    public void DeleteFile(string fileNameWithExtension)
    {
        if (string.IsNullOrEmpty(fileNameWithExtension))
            throw new ArgumentNullException(nameof(fileNameWithExtension));

        var filePath = GetFilePath(fileNameWithExtension);

        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found!", filePath);

        File.Delete(filePath);
    }

    #region Helpers
        private string GetUploadsPath() => Path.Combine(_environment.ContentRootPath, UPLOADS_FOLDER_NAME);

        private static void EnsureDirectoryExists(string path)
        {
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);
        }

        private static string GenerateUniqueFileName(string originalFileName)
        {
            var ext = Path.GetExtension(originalFileName);
            return $"{Guid.NewGuid()}{ext}";
        }

        private void ValidateFileExtension(string fileName, string[] allowedExtensions)
        {
            var ext = Path.GetExtension(fileName);
            if (!allowedExtensions.Contains(ext)) // TODO: Start adding try and catch and propagate throws...
                throw new ArgumentException($"Invalid file extension. Allowed: {string.Join(", ", allowedExtensions)}");
        }

        private static async Task SaveFileToDisk(IFormFile file, string fullPath)
        {
            await using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);
        }

        private string GetFilePath(string fileName)
        {
            return Path.Combine(GetUploadsPath(), fileName);
        }

    #endregion

}
