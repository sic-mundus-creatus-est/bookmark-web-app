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
                CreateMap<BookCreateDTO, Book>();
                CreateMap<Book, BookResponseDTO>()
                        .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.Reviews.Where(r => r.Rating != null).Average(r => (double?)r.Rating)))
                        .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count()));
                CreateMap<BookAuthor, BookAuthorResponseDTO>()
                        .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Author.Id))
                        .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Author.Name));
                CreateMap<BookGenre, BookGenreResponseDTO>()
                        .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Genre.Id))
                        .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Genre.Name));
                CreateMap<BookType, BookType>();
                CreateMap<BookType, BookTypeResponseDTO>();
                CreateMap<Book, BookLinkDTO>()
                        .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.Reviews.Where(r => r.Rating != null).Average(r => (double?)r.Rating)))
                        .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count()));
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

                //REVIEW_________________________________________________________________________________________
                CreateMap<BookReview, BookReviewResponseDTO>();
                CreateMap<BookReviewCreateDTO, BookReview>();
                //_______________________________________________________________________________________________
    }

}
