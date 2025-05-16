namespace BookMark.Services.Core;

public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file, string[] allowedFileExtensions, long maxFileSize);
    void DeleteFile(string fileNameWithExtension);
}

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;
    
    private const string UPLOADS_FOLDER_NAME = "Uploads";
    private readonly string uploadsPath;

    private const long Bytes = 1024L * 1024; // Bytes in a MB

    public FileService(IWebHostEnvironment environment)
    {
        uploadsPath = Path.Combine(environment.ContentRootPath, UPLOADS_FOLDER_NAME);

        _environment = environment;
    }
    

    public async Task<string> SaveFileAsync(IFormFile file, string[] allowedFileExtensions, long maxFileSizeMegaBytes)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException($"The uploaded file '{file?.FileName}' is empty! Unable to save it on the server.", nameof(file));
        if(file.Length > maxFileSizeMegaBytes*Bytes)
            throw new ArgumentException($"The uploaded file '{file?.FileName}' exceedes the max file size of {maxFileSizeMegaBytes}MB! Unable to save it on the server.", nameof(file));

        ValidateFileExtension(file.FileName, allowedFileExtensions);

        EnsureDirectoryExists(uploadsPath);

        var fileName = GenerateUniqueFileName(file.FileName);
        var fullPath = Path.Combine(uploadsPath, fileName);
        
        await SaveFileToDisk(file, fullPath);
        return fileName;
    }


    public void DeleteFile(string fileNameWithExtension)
    {
        if (string.IsNullOrEmpty(fileNameWithExtension))
            throw new ArgumentNullException(nameof(fileNameWithExtension));

        var filePath = GetFilePath(fileNameWithExtension);

        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found!", fileNameWithExtension);

        File.Delete(filePath);
    }

    #region Helpers
        private string GetUploadsPath() => Path.Combine(_environment.ContentRootPath, UPLOADS_FOLDER_NAME);

        private static void EnsureDirectoryExists(string path)
        {
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);
        }

        private static void ValidateFileExtension(string fileName, string[] allowedExtensions)
        {
            var ext = Path.GetExtension(fileName);
            if (!allowedExtensions.Contains(ext))
                throw new ArgumentException($"Invalid file extension. Allowed: {string.Join(", ", allowedExtensions)}");
        }

        private static string GenerateUniqueFileName(string originalFileName)
        {
            var ext = Path.GetExtension(originalFileName);
            return $"{Guid.NewGuid()}{ext}";
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
