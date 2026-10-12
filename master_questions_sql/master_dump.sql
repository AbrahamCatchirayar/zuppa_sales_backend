--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.sectors VALUES ('717a6378-0149-4ef0-96f0-99855ef433fe', '2025-05-09 12:16:05.949365', '2025-05-09 12:16:05.949365', false, NULL, 'string');
INSERT INTO public.sectors VALUES ('3a99bced-a253-4bb3-9265-6ec97d7e031f', '2025-05-09 12:17:04.834457', '2025-05-09 12:17:04.834457', false, NULL, 'Sector');
INSERT INTO public.sectors VALUES ('60b53c19-898b-43ee-9e70-641ec3588d66', '2025-05-09 12:28:11.036673', '2025-05-09 12:31:16.281673', false, NULL, 'sector 1');


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.industries VALUES ('7026aaae-7201-4981-a1f2-b82be4527bf0', '2025-05-09 12:28:20.264713', '2025-05-09 12:31:16.281673', false, NULL, 'industry 1', '', false, '60b53c19-898b-43ee-9e70-641ec3588d66');


--
-- Data for Name: master_modules; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.master_modules VALUES ('6bfbc899-0fd6-41cb-bab5-c626a18747e2', '2025-05-09 11:55:56.149239', '2025-05-09 11:55:56.149239', false, NULL, 'Module 1', '');
INSERT INTO public.master_modules VALUES ('e237f5c8-fcf5-41e0-9b0a-7ca0d6e65eeb', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Employee Engagement', 'Questions related to employee engagement and satisfaction');
INSERT INTO public.master_modules VALUES ('e81008cb-45b2-4211-884b-06d8fdccf8e4', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'NUMERIC Question test', 'NUMERIC Question test');
INSERT INTO public.master_modules VALUES ('e08f138f-b189-49c5-80f4-83e06803eb2d', '2025-05-08 10:24:37.275282', '2025-05-08 10:24:37.275282', false, NULL, 'Module_one', '');
INSERT INTO public.master_modules VALUES ('a99129ae-c4a8-4720-a685-7d6e9dbad3c7', '2025-05-08 10:24:44.442589', '2025-05-08 10:24:44.442589', false, NULL, 'Module_two', '');
INSERT INTO public.master_modules VALUES ('07bdc1e3-f677-4b08-8e20-73b7f876e684', '2025-05-09 13:32:20.481043', '2025-05-09 13:32:20.481043', false, NULL, 'Module 2', '');
INSERT INTO public.master_modules VALUES ('cfe11232-11fb-4bed-8f76-3aa2dcf455ef', '2025-05-09 14:03:20.678898', '2025-05-09 14:03:20.678898', false, NULL, 'Module 3', '');


--
-- Data for Name: master_indicators; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.master_indicators VALUES ('0b173fdc-5c9f-4207-a7ed-e1411f3aebe3', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Work Environment', 'Measures employee satisfaction with their work environment', 'e237f5c8-fcf5-41e0-9b0a-7ca0d6e65eeb');
INSERT INTO public.master_indicators VALUES ('7b36693a-ddd2-49ee-8c1f-cd75798cc1fd', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Team Collaboration', 'Measures effectiveness of team collaboration', 'e237f5c8-fcf5-41e0-9b0a-7ca0d6e65eeb');
INSERT INTO public.master_indicators VALUES ('d654633b-94ea-425f-8d4c-206f3b94921c', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'test', 'test', 'e237f5c8-fcf5-41e0-9b0a-7ca0d6e65eeb');
INSERT INTO public.master_indicators VALUES ('f5448af0-059a-43f6-9ec0-d2f1b6eee750', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'NUMERIC Question test', 'NUMERIC Question test', 'e81008cb-45b2-4211-884b-06d8fdccf8e4');
INSERT INTO public.master_indicators VALUES ('b25d7fc2-2666-42ec-8509-c2576139d98b', '2025-05-08 10:24:57.928207', '2025-05-08 10:24:57.928207', false, NULL, 'm1_Indicator_one', '', 'e08f138f-b189-49c5-80f4-83e06803eb2d');
INSERT INTO public.master_indicators VALUES ('10ffb46e-fe31-48ea-823d-019779aa6748', '2025-05-08 10:25:06.548046', '2025-05-08 10:25:06.548046', false, NULL, 'm1_indicator_two', '', 'e08f138f-b189-49c5-80f4-83e06803eb2d');
INSERT INTO public.master_indicators VALUES ('82404deb-6834-4d0d-936b-c3f94ab3efaa', '2025-05-08 10:25:17.481616', '2025-05-08 10:25:17.481616', false, NULL, 'm2_indicator_one', '', 'a99129ae-c4a8-4720-a685-7d6e9dbad3c7');
INSERT INTO public.master_indicators VALUES ('743fb419-3333-421e-909e-ac104fd4f6a7', '2025-05-08 10:25:28.312988', '2025-05-08 10:25:28.312988', false, NULL, 'm2_indicator_two', '', 'a99129ae-c4a8-4720-a685-7d6e9dbad3c7');
INSERT INTO public.master_indicators VALUES ('76145883-c640-4235-b779-1b0e87fcfc3e', '2025-05-09 13:33:04.971649', '2025-05-09 13:34:04.781161', false, NULL, 'Indicator 1', '', 'a99129ae-c4a8-4720-a685-7d6e9dbad3c7');
INSERT INTO public.master_indicators VALUES ('8baa07aa-840c-49b8-a792-68d1b2d269cc', '2025-05-09 14:04:12.533511', '2025-05-09 14:04:12.533511', false, NULL, 'Indicator 3', '', 'a99129ae-c4a8-4720-a685-7d6e9dbad3c7');
INSERT INTO public.master_indicators VALUES ('3797890c-cd18-43a3-94e6-4a1934f1d588', '2025-05-09 14:05:34.832046', '2025-05-09 14:05:34.832046', false, NULL, 'Indicator 4', '', 'cfe11232-11fb-4bed-8f76-3aa2dcf455ef');
INSERT INTO public.master_indicators VALUES ('8fc3b280-17c9-4e76-b33b-e553a54394d5', '2025-05-09 14:31:22.16621', '2025-05-09 14:31:22.16621', false, NULL, 'Indicator 9', '', '6bfbc899-0fd6-41cb-bab5-c626a18747e2');


--
-- Data for Name: master_subindicators; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.master_subindicators VALUES ('ab1f70fc-c827-41e1-a067-eaeb0685c661', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Sub indicator 1', NULL, false);
INSERT INTO public.master_subindicators VALUES ('372f2599-2c8b-41e1-9078-e8acb89dc6dd', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Sub indicator 2', NULL, false);
INSERT INTO public.master_subindicators VALUES ('1d97ae23-ea34-49c5-b0f5-924a7bf2709a', '2025-05-08 10:25:37.205198', '2025-05-08 10:25:37.205198', false, NULL, 'sub_one', '', false);
INSERT INTO public.master_subindicators VALUES ('e906dcf3-5c97-4918-ab9f-bf2b7dfade37', '2025-05-08 10:25:41.802465', '2025-05-08 10:25:41.802465', false, NULL, 'sub_two', '', false);


--
-- Data for Name: master_questions; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.master_questions VALUES ('32ffa193-460e-41d6-b9c9-14ac66a67153', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'How would you rate your work environment?', 'Please rate your overall satisfaction with your work environment', 'SINGLE_SELECT', 'Select your rating', '0b173fdc-5c9f-4207-a7ed-e1411f3aebe3', 'ab1f70fc-c827-41e1-a067-eaeb0685c661');
INSERT INTO public.master_questions VALUES ('34946dc1-ed9a-4591-99f4-544ef9ed76cc', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'How effective is the collaboration within your team?', 'Please rate the effectiveness of collaboration in your team', 'SINGLE_SELECT', 'Select your rating', '7b36693a-ddd2-49ee-8c1f-cd75798cc1fd', '372f2599-2c8b-41e1-9078-e8acb89dc6dd');
INSERT INTO public.master_questions VALUES ('3af2a1f4-b9fd-44c7-a619-c6dcef1ce335', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'NUMERIC Question test', 'NUMERIC Question test', 'NUMERIC', 'numeric', 'f5448af0-059a-43f6-9ec0-d2f1b6eee750', '372f2599-2c8b-41e1-9078-e8acb89dc6dd');
INSERT INTO public.master_questions VALUES ('581d4eda-8388-4bcb-947b-f150640cfb76', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Please describe your work environment', 'Provide detailed feedback about your work environment', 'MIXED_TYPE', 'Enter your feedback', '0b173fdc-5c9f-4207-a7ed-e1411f3aebe3', 'ab1f70fc-c827-41e1-a067-eaeb0685c661');
INSERT INTO public.master_questions VALUES ('1ca165cb-2d47-431d-9b51-c48af6f8bff4', '2025-05-08 10:32:03.238084', '2025-05-08 10:32:03.238084', false, NULL, 'M1_indicator1_Q3_mixed', 'adfk ljadkfja lkfjdlksf;dlsjf;a djf;adsf jldaskf', 'MIXED_TYPE', 'M1_I1_Q3', 'b25d7fc2-2666-42ec-8509-c2576139d98b', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('77074a7e-3163-4986-8f6e-bfb027d83b96', '2025-05-08 10:40:13.247997', '2025-05-08 10:40:13.247997', false, NULL, 'M1_Indicator1_question4_Single_select', 'asdfkdasjl kdslfj ldskjfladskjfl das', 'SINGLE_SELECT', 'M1_I1_q4_Single_select', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('0adefa75-b7ba-4773-8400-27add155d0c1', '2025-05-08 10:40:30.216042', '2025-05-08 10:40:30.216042', false, NULL, 'M2_i2_q1_TEXT', 'sajhdkfhsdf', 'TEXT', 'M2_i2_q1', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('5e5bfc9e-6974-4178-99e8-a5824911410d', '2025-05-08 10:41:11.34526', '2025-05-08 10:41:11.34526', false, NULL, 'M1_I1_Que4_Single_select', 'asjflkasd ads lakdsjl kajdslkfadslfjasd', 'SINGLE_SELECT', 'sdfakjsdl ds dksjfl ds fjldsfj lds', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('609b6479-410f-4f31-82c4-c6fcf5b884c8', '2025-05-08 10:41:50.407494', '2025-05-08 10:41:50.407494', false, NULL, 'M2_i2_q2_SINGLE_SELECT', 'ejksjkdnfasd', 'SINGLE_SELECT', 'M2_i2_q2', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('0e8f9bae-e05f-4ace-9383-5c50854520c8', '2025-05-08 10:43:58.319796', '2025-05-08 10:43:58.319796', false, NULL, 'M2_i2_q3_MULTI_TEXT', 'kaslkfsaduiwhudh', 'MULTI_SELECT', 'M2_i2_q3', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('81e0cb7c-548d-445c-92f6-44b9f38bf7d2', '2025-05-08 10:44:43.634947', '2025-05-08 10:44:43.634947', false, NULL, 'M2_i2_q4_NUMBER', 'asdsaldfj sjdhljkfh', 'NUMBER', 'M2_i2_q4', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('eaa23974-e020-4523-8a64-68b90a94ac5b', '2025-05-08 10:45:16.623105', '2025-05-08 10:45:16.623105', false, NULL, 'M2_i2_q5_DATE', 'dsojafksaldkfs', 'DATE', 'M2_i2_q5', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('bb42fe0e-33ac-4ea8-a163-c44aa423e658', '2025-05-08 10:46:00.039968', '2025-05-08 10:46:00.039968', false, NULL, 'M1_I1_Q1_(file_type)', 'sjlkdfjkls', 'FILE', 'file', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('88df9db7-f1df-4ab3-b465-58a6480e570a', '2025-05-08 10:47:55.69325', '2025-05-08 10:47:55.69325', false, NULL, 'M2_i2_q7_FILE', 'ajksjdbasdasd', 'FILE', 'M2_i2_q7', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('257bab34-6a26-48b0-a3dc-ebb124844077', '2025-05-08 10:51:15.44728', '2025-05-08 10:51:15.44728', false, NULL, 'M2_i2_q9_SINGLE_SELECT(2nd)', 'aksjdajsdlasjkdjasd', 'SINGLE_SELECT', 'M2_i2_q9', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('9f10d1d5-7c0c-4794-8144-7fdd99039f4d', '2025-05-08 10:52:14.033687', '2025-05-08 10:52:14.033687', false, NULL, 'M2_i2_q10_SINGLE_SELECT(3rd)', 'sdkjfhlkjsdhjfsd', 'SINGLE_SELECT', 'M2_i2_q10', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('9164687f-704b-424e-8e2a-be62582a6c18', '2025-05-08 10:45:58.608582', '2025-05-08 10:53:29.344268', false, NULL, 'M2_i2_q6_URL', 'wihsdkjhfjsafjsdf', 'URL', 'M2_i2_q6', '743fb419-3333-421e-909e-ac104fd4f6a7', 'e906dcf3-5c97-4918-ab9f-bf2b7dfade37');
INSERT INTO public.master_questions VALUES ('ee2a1107-c65f-49c7-b829-41301d1c93db', '2025-05-08 10:30:03.102838', '2025-05-08 10:54:30.748656', false, NULL, 'm1_I2_q1 ( Text)', 'fdlkadlsjf alksdjflk adjsflkjadslkf', 'TEXT', 'test', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('bf4f6cc8-acfd-48dc-9032-e6b231309ed9', '2025-05-08 10:55:44.409475', '2025-05-08 10:55:44.409475', false, NULL, 'M1_I1_Q1_(Single_select_01)', 'dlkfjsd fkl kjkldskfjs f jfkl f', 'SINGLE_SELECT', 'Single_select_01', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('b4064e34-6c1e-4b95-9e04-f1c4e9713603', '2025-05-08 10:55:46.669038', '2025-05-08 10:55:46.669038', false, NULL, 'M2_i1_q1_TEXT', 'sjdlhjkhsajf', 'TEXT', 'M2_i1_q1', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('2512a6b2-8497-4a66-bea8-6ad5a96ce1de', '2025-05-08 10:57:09.283822', '2025-05-08 10:57:09.283822', false, NULL, 'M2_i1_q2_SINGLE_SELECT', 'askjndkjankjdnka', 'SINGLE_SELECT', 'M2_i1_q2', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('bcc8ff7b-2063-4b82-92de-bb94c75dc90b', '2025-05-08 10:58:00.688284', '2025-05-08 10:58:00.688284', false, NULL, 'M2_i1_q3_MULTI_SELECT', 'jshfdjkhasjdfjadsf', 'MULTI_SELECT', 'M2_i1_q3', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('8f1c37d6-7d6b-4c27-b3b4-48c1bda90199', '2025-05-08 10:58:38.000912', '2025-05-08 10:58:38.000912', false, NULL, 'M2_i1_q4_NUMBER', 'ksajdkljklasjdkljaklsd', 'NUMBER', 'M2_i1_q4', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('7ee5e06b-14e2-4715-9ce5-c2a0d1b37372', '2025-05-08 10:59:15.912288', '2025-05-08 10:59:15.912288', false, NULL, 'M2_i1_q5_DATE', 'aslkdmlasmdkjklasd', 'DATE', 'M2_i1_q5', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('f4f221b5-5ef7-4327-a25e-25ff9fa5ed23', '2025-05-08 11:00:24.892706', '2025-05-08 11:01:14.730819', false, NULL, 'M2_i1_q7_URL', 'lkasmldkjklasjkldjjsad', 'URL', 'M2_i1_q7', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('f10311da-8570-456d-90da-c8385f688e2f', '2025-05-08 10:59:48.924482', '2025-05-08 11:01:28.899338', false, NULL, 'M2_i1_q6_FILE', 'dsjlkajslkjdkla', 'FILE', 'M2_i1_q6', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('19345070-050b-4b66-a481-1396bd5a58fa', '2025-05-08 10:45:07.639659', '2025-05-08 11:03:31.552564', false, NULL, 'M1_I1_Q1_(url)', 'asdfsdfasf', 'URL', 'Url', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('90ecce3f-4193-4f25-9347-66dd99dd1e80', '2025-05-08 11:04:20.641104', '2025-05-08 11:04:20.641104', false, NULL, 'M2_i1_q9_SINGLE_SELECT(2nd)', 'asdhkashdjsak', 'SINGLE_SELECT', 'M2_i1_q9', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('755882fa-83d1-4813-abdb-17d0344b2a0e', '2025-05-08 11:05:04.148643', '2025-05-08 11:05:04.148643', false, NULL, 'M2_i1_q10_SINGLE_SELECT(3nd)', 'aslkdjklajdkljalkjks', 'SINGLE_SELECT', 'M2_i1_q10', '82404deb-6834-4d0d-936b-c3f94ab3efaa', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('97a6397a-9558-4cc8-a492-039fb753a5f4', '2025-05-08 11:07:49.850693', '2025-05-08 11:07:49.850693', false, NULL, 'M1_I1_Q1_(Text_type)', 'adfasdfsdav safasdf', 'TEXT', 'Text', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('ca9db116-5d98-4683-a9d5-a952b85081f7', '2025-05-08 11:09:57.840214', '2025-05-08 11:09:57.840214', false, NULL, 'M1_I1_Q1_(Url-type)', 'sadasdfsadf asefs', 'URL', 'Url', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('55d8b36c-f66d-471d-b5aa-a6142f18a076', '2025-05-08 10:30:49.399955', '2025-05-08 11:17:45.08907', false, NULL, 'm1_I2_updated_q2 - single_select', 'dfk ajdhfk alsdhfkjad hfkjadh fjkdas', 'SINGLE_SELECT', 'm1_i2_q2', '10ffb46e-fe31-48ea-823d-019779aa6748', NULL);
INSERT INTO public.master_questions VALUES ('0f83ebfe-1db1-4bde-8dd3-25300483196e', '2025-05-08 10:47:18.037901', '2025-05-08 11:23:01.001582', false, NULL, 'M1_I1_Q2_(date_type)', 'ljdlkfSDASAS', 'DATE', 'Data_type', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('86e1eaa3-8c43-475a-86a0-babd78e122fc', '2025-05-08 10:48:17.151747', '2025-05-08 11:23:15.268449', false, NULL, 'M1_I1_Q3_(Number_type)', 'kkdfjkk kdkjfkdf j ksjdf', 'NUMBER', 'Number_type', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('d48d2f20-f5dc-432c-89a5-4a18a01b1a13', '2025-05-08 11:29:11.320766', '2025-05-08 11:29:11.320766', false, NULL, 'M1_I2_Q1_(Multi_type)', 'asegsg dg s gsg safg sf g', 'MULTI_SELECT', 'Multi_type', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('def8b2e6-c1dd-4854-9ef4-266833182aa0', '2025-05-08 11:21:38.757865', '2025-05-08 11:29:24.810208', false, NULL, 'M1_I2_Q2_(Text)', 'sagasv  wat wrt ert ert e ertwr wre', 'TEXT', 'Text', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('56bcf34e-75a4-4d7c-a0aa-93cba82ca068', '2025-05-08 11:31:59.581719', '2025-05-08 11:31:59.581719', false, NULL, 'M1_I2_Q3_(Single_select_01)', 'AFSADF F SFSDF SA  SDC', 'SINGLE_SELECT', 'Single_select_01', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('78f62ce0-ed5b-4ecf-a655-9a08ee8f9a99', '2025-05-08 11:33:56.226541', '2025-05-08 11:33:56.226541', false, NULL, 'M1_I2_Q4_(Single_select_02)', 'asdvsa af sdfsa saf sdf sd', 'SINGLE_SELECT', 'Single_select_02', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('616328d2-535f-4b70-97dd-83b59d80347c', '2025-05-08 11:34:52.918523', '2025-05-08 11:34:52.918523', false, NULL, 'M1_I2_Q5_(Single_select_03)', 'asdg sd fsadf safsa f', 'SINGLE_SELECT', 'Single_select_03', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('6bcb2459-e714-4d9a-813e-b41d96b0e53e', '2025-05-08 11:35:52.121495', '2025-05-08 11:35:52.121495', false, NULL, 'M1_I2_Q6_(Number_type)', 'adfsadfs f sadf sadf sa', 'NUMBER', 'Number_type', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('23380be6-aaad-421e-9d61-0155a9c9612c', '2025-05-08 11:36:35.526781', '2025-05-08 11:36:35.526781', false, NULL, 'M1_I2_Q7_(Data_type)', 'adf asfsd fsdf sf', 'DATE', 'Data_type', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('fbe877d0-1919-4e7b-8de7-8d9e5b2e9931', '2025-05-08 11:50:38.384215', '2025-05-08 11:50:38.384215', false, NULL, 'M1_I2_Q8_(File_type)', 'sljglk skljljlsk sfklsjaf lsajflk', 'FILE', 'File_type', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('7e9c96ab-05fb-4413-bc48-9ee26bd5d6a8', '2025-05-08 11:51:15.258101', '2025-05-08 11:51:15.258101', false, NULL, 'M1_I2_Q9_(Url_type)', 'awf fsadf sadfsaf saf', 'URL', 'Url_type', '10ffb46e-fe31-48ea-823d-019779aa6748', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('7de0394a-c776-4c14-be4e-ae8a5ed55d4b', '2025-05-08 11:06:48.43964', '2025-05-08 11:54:49.479528', false, NULL, 'M1_I1_Q2_(Multi)', 'asfca fdc adSDAAFA das', 'MULTI_SELECT', 'Multi', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('23597700-364e-4b07-b92e-b9b8562d4060', '2025-05-08 11:56:29.182235', '2025-05-08 11:56:29.182235', false, NULL, 'M1_I1_Q3_(Single_select_01)', 'sadfsadf sdf sdfsa sadf sad', 'SINGLE_SELECT', 'Single_select_01', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('a3a6947b-4efe-476f-9bf9-b7bc9f6f0738', '2025-05-08 11:01:28.466414', '2025-05-08 11:57:13.021372', false, NULL, 'M1_I1_Q4_(Single_select_02)', 'slfjlkad fl  sljf akdf kl', 'SINGLE_SELECT', 'Single_select_02', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('fb3a9e2d-667d-43d1-ad58-fe2b977aef79', '2025-05-08 11:02:37.517916', '2025-05-08 11:57:27.732053', false, NULL, 'M1_I1_Q5_(Single_select_03)', 'ZFDFSB D DFGSD GGS SD', 'SINGLE_SELECT', 'Single_select_03', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('5430a84d-1236-4cae-bfd5-22eb349e176f', '2025-05-08 11:58:45.546457', '2025-05-08 11:58:45.546457', false, NULL, 'M1_I1_Q6_(Number_type)', 'asda DADAS Asd asd', 'NUMBER', 'Number_type', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('a36a49b6-dffb-4e32-a2ab-5ddb039703ec', '2025-05-08 11:59:43.558695', '2025-05-08 11:59:43.558695', false, NULL, 'M1_I1_Q7_(Date_type)', 'sadfsadf sfda', 'DATE', 'Data_type', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('47bbd061-2bc1-4949-b63a-d2e86dba31d7', '2025-05-08 12:00:49.401817', '2025-05-08 12:00:49.401817', false, NULL, 'M1_I1_Q8_(File_type)', 'asfdasd fafsafdsa', 'FILE', 'File_type', 'b25d7fc2-2666-42ec-8509-c2576139d98b', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('22acd636-e919-43f1-92cf-623a6e285da6', '2025-05-09 14:06:50.402248', '2025-05-09 14:06:50.402248', false, NULL, 'Question 20', 'entr the value', 'NUMBER', 'Enter the value', '3797890c-cd18-43a3-94e6-4a1934f1d588', '1d97ae23-ea34-49c5-b0f5-924a7bf2709a');
INSERT INTO public.master_questions VALUES ('b5bde1f3-1756-4cb0-a21d-6c050afea9ef', '2025-05-09 12:02:48.069752', '2025-05-09 14:19:45.956604', false, NULL, 'Question test', 'Question test', 'TEXT', 'test', 'd654633b-94ea-425f-8d4c-206f3b94921c', 'ab1f70fc-c827-41e1-a067-eaeb0685c661');
INSERT INTO public.master_questions VALUES ('cf7ec86f-db1b-4d5e-84a7-b18a669e544c', '2025-05-09 14:33:12.893173', '2025-05-09 14:33:30.034669', false, NULL, 'Question 7', 'select ur option', 'MULTI_SELECT', 'select', '8fc3b280-17c9-4e76-b33b-e553a54394d5', '372f2599-2c8b-41e1-9078-e8acb89dc6dd');


--
-- Data for Name: mixed_type_questions; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.mixed_type_questions VALUES ('7ee02d99-75a5-459f-921f-4cd3c1efff07', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'TEXT', 'string', '{string}', 'string', 'TEXT', '{kg,l,ml}', '581d4eda-8388-4bcb-947b-f150640cfb76');


--
-- Data for Name: question_options; Type: TABLE DATA; Schema: public; Owner: rubicr
--

INSERT INTO public.question_options VALUES ('a269bf45-45c8-40a4-bf49-0436359bc893', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Very Satisfied', 'very_satisfied', '32ffa193-460e-41d6-b9c9-14ac66a67153', NULL);
INSERT INTO public.question_options VALUES ('16f9362a-ef61-4c31-b174-0309df7dbe5e', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Satisfied', 'satisfied', '32ffa193-460e-41d6-b9c9-14ac66a67153', NULL);
INSERT INTO public.question_options VALUES ('3ab1b686-bdff-47e5-bf21-a49419003e00', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Neutral', 'neutral', '32ffa193-460e-41d6-b9c9-14ac66a67153', NULL);
INSERT INTO public.question_options VALUES ('fa53b697-198c-4c90-a10d-f14cbd7599c1', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Dissatisfied', 'dissatisfied', '32ffa193-460e-41d6-b9c9-14ac66a67153', NULL);
INSERT INTO public.question_options VALUES ('b3195f6a-84f9-45e4-95d4-c5a3e3492467', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Very Dissatisfied', 'very_dissatisfied', '32ffa193-460e-41d6-b9c9-14ac66a67153', NULL);
INSERT INTO public.question_options VALUES ('de045c37-ce0f-467d-91e2-b1d33aae5292', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Very Effective', 'very_effective', '34946dc1-ed9a-4591-99f4-544ef9ed76cc', NULL);
INSERT INTO public.question_options VALUES ('1ebdb37e-9e71-4dd4-b270-c706c308cc38', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Effective', 'effective', '34946dc1-ed9a-4591-99f4-544ef9ed76cc', NULL);
INSERT INTO public.question_options VALUES ('1371b94a-bdfc-42a8-b974-6f45015645bf', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Neutral', 'neutral', '34946dc1-ed9a-4591-99f4-544ef9ed76cc', NULL);
INSERT INTO public.question_options VALUES ('800caa95-c462-41cd-a3ab-62caa90bb7d8', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Ineffective', 'ineffective', '34946dc1-ed9a-4591-99f4-544ef9ed76cc', NULL);
INSERT INTO public.question_options VALUES ('1a47bf7d-333f-4663-a6d4-3b2ca183b766', '2025-05-09 12:02:48.069752', '2025-05-09 12:02:48.069752', false, NULL, 'Very Ineffective', 'very_ineffective', '34946dc1-ed9a-4591-99f4-544ef9ed76cc', NULL);
INSERT INTO public.question_options VALUES ('64e66da0-f3ec-462b-aab5-d81ec0ba8e44', '2025-05-08 10:40:13.247997', '2025-05-08 10:40:13.247997', false, NULL, 'Fixed', '', '77074a7e-3163-4986-8f6e-bfb027d83b96', NULL);
INSERT INTO public.question_options VALUES ('a70c74a6-932f-48e5-810d-7af18abac401', '2025-05-08 10:40:13.247997', '2025-05-08 10:40:13.247997', false, NULL, 'Dynamic', '', '77074a7e-3163-4986-8f6e-bfb027d83b96', NULL);
INSERT INTO public.question_options VALUES ('ca3968b1-9b50-4023-b1f9-2fbc4e3a6bf0', '2025-05-08 10:41:11.34526', '2025-05-08 10:41:11.34526', false, NULL, 'TRUE', '', '5e5bfc9e-6974-4178-99e8-a5824911410d', NULL);
INSERT INTO public.question_options VALUES ('b46037df-7990-4bfd-852f-fee0418f74be', '2025-05-08 10:41:11.34526', '2025-05-08 10:41:11.34526', false, NULL, 'FALSE', '', '5e5bfc9e-6974-4178-99e8-a5824911410d', NULL);
INSERT INTO public.question_options VALUES ('7c90c82f-5d2d-4a31-b3be-e572991a4e43', '2025-05-08 10:41:50.407494', '2025-05-08 10:41:50.407494', false, NULL, 'TRUE', '', '609b6479-410f-4f31-82c4-c6fcf5b884c8', NULL);
INSERT INTO public.question_options VALUES ('daa8a785-aaa1-4826-8675-b9dec4f8d3a9', '2025-05-08 10:41:50.407494', '2025-05-08 10:41:50.407494', false, NULL, 'FALSE', '', '609b6479-410f-4f31-82c4-c6fcf5b884c8', NULL);
INSERT INTO public.question_options VALUES ('699fe7fd-0a1f-4d29-b5e9-0d4a80a9809a', '2025-05-08 10:43:58.319796', '2025-05-08 10:43:58.319796', false, NULL, 'YES', '', '0e8f9bae-e05f-4ace-9383-5c50854520c8', NULL);
INSERT INTO public.question_options VALUES ('add34e9a-e01c-4899-a8ad-f1a63f3cd3ca', '2025-05-08 10:43:58.319796', '2025-05-08 10:43:58.319796', false, NULL, 'NO', '', '0e8f9bae-e05f-4ace-9383-5c50854520c8', NULL);
INSERT INTO public.question_options VALUES ('b0904011-09dd-4abb-88e7-115cddef69fb', '2025-05-08 10:43:58.319796', '2025-05-08 10:43:58.319796', false, NULL, 'LATER', '', '0e8f9bae-e05f-4ace-9383-5c50854520c8', NULL);
INSERT INTO public.question_options VALUES ('fd56217e-0fa5-4f2b-9c67-872cb405f34c', '2025-05-08 10:51:15.44728', '2025-05-08 10:51:15.44728', false, NULL, 'PASS', '', '257bab34-6a26-48b0-a3dc-ebb124844077', NULL);
INSERT INTO public.question_options VALUES ('2821a9a4-c00e-44ca-9e1a-1d9344fc2fe4', '2025-05-08 10:51:15.44728', '2025-05-08 10:51:15.44728', false, NULL, 'FAIL', '', '257bab34-6a26-48b0-a3dc-ebb124844077', NULL);
INSERT INTO public.question_options VALUES ('196af189-2ba4-4112-9f59-8e77cd0da489', '2025-05-08 10:52:14.033687', '2025-05-08 10:52:14.033687', false, NULL, 'PRESENT', '', '9f10d1d5-7c0c-4794-8144-7fdd99039f4d', NULL);
INSERT INTO public.question_options VALUES ('7b654cb7-f5b1-440d-81aa-9dadf0549f8e', '2025-05-08 10:52:14.033687', '2025-05-08 10:52:14.033687', false, NULL, 'ABSENT', '', '9f10d1d5-7c0c-4794-8144-7fdd99039f4d', NULL);
INSERT INTO public.question_options VALUES ('a89b5220-933a-47dd-bc87-e14f3b1e9154', '2025-05-08 10:55:44.409475', '2025-05-08 10:55:44.409475', false, NULL, 'fule', 'l', 'bf4f6cc8-acfd-48dc-9032-e6b231309ed9', NULL);
INSERT INTO public.question_options VALUES ('8e9ea3b5-f722-4adc-b51a-4a4b301d9e3f', '2025-05-08 10:55:44.409475', '2025-05-08 10:55:44.409475', false, NULL, 'stationary', 'Kg', 'bf4f6cc8-acfd-48dc-9032-e6b231309ed9', NULL);
INSERT INTO public.question_options VALUES ('892c4cc0-3014-4065-bb32-2e63273e6d52', '2025-05-08 10:57:09.283822', '2025-05-08 10:57:09.283822', false, NULL, 'TRUE', '', '2512a6b2-8497-4a66-bea8-6ad5a96ce1de', NULL);
INSERT INTO public.question_options VALUES ('c856db23-0efc-4171-bb03-a0106dcb672b', '2025-05-08 10:57:09.283822', '2025-05-08 10:57:09.283822', false, NULL, 'FALSE', '', '2512a6b2-8497-4a66-bea8-6ad5a96ce1de', NULL);
INSERT INTO public.question_options VALUES ('226c3bde-2a24-4678-915b-578b091017b1', '2025-05-08 10:58:00.688284', '2025-05-08 10:58:00.688284', false, NULL, 'YES', '', 'bcc8ff7b-2063-4b82-92de-bb94c75dc90b', NULL);
INSERT INTO public.question_options VALUES ('1f0f3414-5893-4d8d-8938-543a5f40f55f', '2025-05-08 10:58:00.688284', '2025-05-08 10:58:00.688284', false, NULL, 'NO', '', 'bcc8ff7b-2063-4b82-92de-bb94c75dc90b', NULL);
INSERT INTO public.question_options VALUES ('675610b4-5eb7-48d2-8280-0bca2d2a2b3d', '2025-05-08 10:58:00.688284', '2025-05-08 10:58:00.688284', false, NULL, 'LATER', '', 'bcc8ff7b-2063-4b82-92de-bb94c75dc90b', NULL);
INSERT INTO public.question_options VALUES ('b5085021-9039-47f0-9906-3c2d877ca3f4', '2025-05-08 11:01:28.466', '2025-05-08 11:01:28.466', false, NULL, 'fule', 'l', 'a3a6947b-4efe-476f-9bf9-b7bc9f6f0738', NULL);
INSERT INTO public.question_options VALUES ('fb870a97-cdce-4e23-b08b-6b3cc94f6e78', '2025-05-08 11:02:37.517', '2025-05-08 11:02:37.517', false, NULL, 'asdasd', 'Kg', 'fb3a9e2d-667d-43d1-ad58-fe2b977aef79', NULL);
INSERT INTO public.question_options VALUES ('4ed384b8-43c1-4862-93dd-147f9a1659bd', '2025-05-08 11:04:20.641104', '2025-05-08 11:04:20.641104', false, NULL, 'PASS', '', '90ecce3f-4193-4f25-9347-66dd99dd1e80', NULL);
INSERT INTO public.question_options VALUES ('ba52bd33-ca72-4226-b1fa-ecdb2e1afea3', '2025-05-08 11:04:20.641104', '2025-05-08 11:04:20.641104', false, NULL, 'FAIL', '', '90ecce3f-4193-4f25-9347-66dd99dd1e80', NULL);
INSERT INTO public.question_options VALUES ('e69bade1-9520-4987-ad0c-795ec6092e13', '2025-05-08 11:05:04.148643', '2025-05-08 11:05:04.148643', false, NULL, 'PRESENT', '', '755882fa-83d1-4813-abdb-17d0344b2a0e', NULL);
INSERT INTO public.question_options VALUES ('f5344c95-f12d-42c4-9c55-6e7d51737033', '2025-05-08 11:05:04.148643', '2025-05-08 11:05:04.148643', false, NULL, 'ABSENT', '', '755882fa-83d1-4813-abdb-17d0344b2a0e', NULL);
INSERT INTO public.question_options VALUES ('1efa3205-b330-44f5-90ba-f6098e5f0a81', '2025-05-08 11:02:37.517', '2025-05-08 11:02:37.517', false, NULL, 'xAsvc z', 'l', 'fb3a9e2d-667d-43d1-ad58-fe2b977aef79', NULL);
INSERT INTO public.question_options VALUES ('046976d3-96de-490f-9805-af023ac8753c', '2025-05-08 10:30:49.399', '2025-05-08 10:30:49.399', false, NULL, 'NO', '', '55d8b36c-f66d-471d-b5aa-a6142f18a076', NULL);
INSERT INTO public.question_options VALUES ('778965a9-3cb8-4a4e-8836-52d9185f60be', '2025-05-08 10:30:49.399', '2025-05-08 10:30:49.399', false, NULL, 'YES', '', '55d8b36c-f66d-471d-b5aa-a6142f18a076', NULL);
INSERT INTO public.question_options VALUES ('9d01da45-d273-4541-aa51-00a191af8a02', '2025-05-08 11:29:11.320766', '2025-05-08 11:29:11.320766', false, NULL, 'fule', 'l', 'd48d2f20-f5dc-432c-89a5-4a18a01b1a13', NULL);
INSERT INTO public.question_options VALUES ('8e4b1696-ec7c-4b1f-9030-b2bb5513da17', '2025-05-08 11:29:11.320766', '2025-05-08 11:29:11.320766', false, NULL, 'asdasd', 'Kg', 'd48d2f20-f5dc-432c-89a5-4a18a01b1a13', NULL);
INSERT INTO public.question_options VALUES ('236a6df2-78af-4a96-aafe-b8921444d4fd', '2025-05-08 11:31:59.581719', '2025-05-08 11:31:59.581719', false, NULL, 'fule', 'l', '56bcf34e-75a4-4d7c-a0aa-93cba82ca068', NULL);
INSERT INTO public.question_options VALUES ('c17099a8-e383-4efb-a362-2671065ab4cd', '2025-05-08 11:31:59.581719', '2025-05-08 11:31:59.581719', false, NULL, 'asdasd', 'Kg', '56bcf34e-75a4-4d7c-a0aa-93cba82ca068', NULL);
INSERT INTO public.question_options VALUES ('46bb3019-cbfb-4d75-a649-54b8624bc245', '2025-05-08 11:33:56.226541', '2025-05-08 11:33:56.226541', false, NULL, 'fule', 'l', '78f62ce0-ed5b-4ecf-a655-9a08ee8f9a99', NULL);
INSERT INTO public.question_options VALUES ('b1032194-1bed-4bed-b0ad-c68cd1ab504a', '2025-05-08 11:33:56.226541', '2025-05-08 11:33:56.226541', false, NULL, 'asc', 'sdv', '78f62ce0-ed5b-4ecf-a655-9a08ee8f9a99', NULL);
INSERT INTO public.question_options VALUES ('b418f89a-6aee-4e2f-8efb-96c96bb4865f', '2025-05-08 11:34:52.918523', '2025-05-08 11:34:52.918523', false, NULL, 'xAsvc z', 'sdf', '616328d2-535f-4b70-97dd-83b59d80347c', NULL);
INSERT INTO public.question_options VALUES ('33335dd0-62c4-490f-b909-cf8cf5f1dda0', '2025-05-08 11:34:52.918523', '2025-05-08 11:34:52.918523', false, NULL, 'asdasd', 'Kg', '616328d2-535f-4b70-97dd-83b59d80347c', NULL);
INSERT INTO public.question_options VALUES ('b8fba18f-6910-4370-b4c5-0153ad2c748b', '2025-05-08 11:06:48.439', '2025-05-08 11:06:48.439', false, NULL, 'fulesvs', 'l', '7de0394a-c776-4c14-be4e-ae8a5ed55d4b', NULL);
INSERT INTO public.question_options VALUES ('43eb566b-8d6c-4d7f-affb-51589df6b4da', '2025-05-08 11:06:48.439', '2025-05-08 11:06:48.439', false, NULL, 'asdasd', 'Kg', '7de0394a-c776-4c14-be4e-ae8a5ed55d4b', NULL);
INSERT INTO public.question_options VALUES ('b4e75643-bac9-4d64-b589-d02eb3297d60', '2025-05-08 11:56:29.182235', '2025-05-08 11:56:29.182235', false, NULL, 'fule', 'll', '23597700-364e-4b07-b92e-b9b8562d4060', NULL);
INSERT INTO public.question_options VALUES ('2e43c2a4-535f-4e6d-96da-fc266715ff71', '2025-05-08 11:56:29.182235', '2025-05-08 11:56:29.182235', false, NULL, 'asdasd', 'Kg', '23597700-364e-4b07-b92e-b9b8562d4060', NULL);
INSERT INTO public.question_options VALUES ('e1dc093b-5ba9-4291-9575-8896c900faf5', '2025-05-08 11:01:28.466', '2025-05-08 11:01:28.466', false, NULL, 'stationary', 'Kg', 'a3a6947b-4efe-476f-9bf9-b7bc9f6f0738', NULL);
INSERT INTO public.question_options VALUES ('7c365f62-c18c-4988-b188-848ac1365b22', '2025-05-09 14:33:12.893', '2025-05-09 14:33:12.893', false, NULL, 'test1', '34', 'cf7ec86f-db1b-4d5e-84a7-b18a669e544c', NULL);
INSERT INTO public.question_options VALUES ('ca13ae0f-97e6-4fc4-82fb-e2b2de829d50', '2025-05-09 14:33:12.893', '2025-05-09 14:33:12.893', false, NULL, 'test12', '54', 'cf7ec86f-db1b-4d5e-84a7-b18a669e544c', NULL);


--
-- PostgreSQL database dump complete
--

