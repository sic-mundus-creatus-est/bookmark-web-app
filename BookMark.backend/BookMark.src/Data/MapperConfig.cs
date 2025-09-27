using AutoMapper;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Data;

public class MapperConfig : Profile
{
    public MapperConfig()
    {
        //BOOK___________________________________________________________________________________________
        CreateMap<Book, Book>();
        CreateMap<BookCreateDTO, Book>()
        .ForPath(dest => dest.BookTypeId, opt => opt.MapFrom(src => src.BookTypeId));
        CreateMap<Book, BookResponseDTO>()
                            .ForMember(dest => dest.Authors, opt => opt.MapFrom(src => src.BookAuthors))
                            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src => src.BookGenres));
        CreateMap<BookAuthor, BookAuthorResponseDTO>()
                            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Author.Id))
                            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Author.Name));
        CreateMap<BookGenre, BookGenreResponseDTO>()
                            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Genre.Id))
                            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Genre.Name));
        CreateMap<BookType, BookType>();
        CreateMap<BookType, BookTypeResponseDTO>();
        CreateMap<Book, BookLinkDTO>()
                            .ForMember(dest => dest.Authors, opt => opt.MapFrom(src => src.BookAuthors));
        //_______________________________________________________________________________________________

        //AUTHOR_________________________________________________________________________________________
        CreateMap<Author, Author>();
        CreateMap<AuthorCreateDTO, Author>();
        CreateMap<Author, AuthorResponseDTO>();
        CreateMap<Author, AuthorLinkDTO>();
        //_______________________________________________________________________________________________

        //GENRE__________________________________________________________________________________________
        CreateMap<Genre, Genre>();
        CreateMap<GenreCreateDTO, Genre>();
        CreateMap<Genre, GenreResponseDTO>();
        CreateMap<Genre, GenreLinkDTO>();
        //_______________________________________________________________________________________________

        //USER___________________________________________________________________________________________
        CreateMap<User, User>();
        CreateMap<UserCreateDTO, User>();
        CreateMap<User, UserResponseDTO>();
        CreateMap<User, UserLinkDTO>();
        //_______________________________________________________________________________________________
    }

}
